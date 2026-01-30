(use-trait sip010-trait .sip010-trait.sip010-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-asset-not-supported (err u103))
(define-constant err-transfer-failed (err u104))
(define-constant err-not-authorized (err u105))
(define-constant err-contract-paused (err u106))

;; Contract state
(define-data-var contract-paused bool false)

;; Asset registry
(define-map supported-assets principal bool)
(define-map asset-balances {user: principal, asset: principal} uint)
(define-map asset-fees principal uint)

;; Initialize STX as supported asset
(map-set supported-assets 'STX true)

(define-public (add-supported-asset (asset principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (print {event: "asset-added", asset: asset})
    (ok (map-set supported-assets asset true))))

(define-public (remove-supported-asset (asset principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    ;; Note: Does not affect existing balances, just prevents new deposits
    (print {event: "asset-removed", asset: asset})
    (ok (map-set supported-assets asset false))))

;; Pause contract (emergency stop)
(define-public (pause-contract)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-paused true)
    (print {event: "contract-paused", by: tx-sender})
    (ok true)))

;; Unpause contract
(define-public (unpause-contract)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-paused false)
    (print {event: "contract-unpaused", by: tx-sender})
    (ok true)))

;; Check if contract is paused
(define-read-only (is-paused)
  (var-get contract-paused))

(define-public (deposit-stx (amount uint))
  (let ((fee (/ amount u100))
        (user-amount (- amount fee))
        (current-balance (get-asset-balance tx-sender 'STX)))
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set asset-balances {user: tx-sender, asset: 'STX} (+ current-balance user-amount))
    (map-set asset-fees 'STX (+ (get-asset-fees 'STX) fee))
    (print {event: "deposit", user: tx-sender, asset: 'STX, amount: user-amount, fee: fee})
    (ok user-amount)))

(define-public (deposit-sip010 (token <sip010-trait>) (amount uint))
  (let ((asset (contract-of token))
        (is-supported (default-to false (map-get? supported-assets asset)))
        (fee (/ amount u100))
        (user-amount (- amount fee))
        (current-balance (get-asset-balance tx-sender asset)))
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! is-supported err-asset-not-supported)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (contract-call? token transfer amount tx-sender (as-contract tx-sender) none))
    (map-set asset-balances {user: tx-sender, asset: asset} (+ current-balance user-amount))
    (map-set asset-fees asset (+ (get-asset-fees asset) fee))
    (print {event: "deposit", user: tx-sender, asset: asset, amount: user-amount, fee: fee})
    (ok user-amount)))

(define-public (withdraw-stx (amount uint))
  (let ((sender tx-sender)
        (balance (get-asset-balance tx-sender 'STX)))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= balance amount) err-insufficient-balance)
    (map-set asset-balances {user: sender, asset: 'STX} (- balance amount))
    ;; Transfer from contract to the user (sender captured before as-contract)
    (try! (as-contract (stx-transfer? amount tx-sender sender)))
    (print {event: "withdrawal", user: sender, asset: 'STX, amount: amount})
    (ok true)))

(define-public (withdraw-sip010 (token <sip010-trait>) (amount uint))
  (let ((sender tx-sender)
        (asset (contract-of token))
        (balance (get-asset-balance tx-sender asset)))
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= balance amount) err-insufficient-balance)
    (map-set asset-balances {user: sender, asset: asset} (- balance amount))
    ;; Transfer from contract to the user (sender captured before as-contract)
    (try! (as-contract (contract-call? token transfer amount tx-sender sender none)))
    (print {event: "withdrawal", user: sender, asset: asset, amount: amount})
    (ok true)))

;; Owner function to withdraw accumulated STX fees
(define-public (owner-withdraw-stx-fees (amount uint))
  (let ((available-fees (get-asset-fees 'STX)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= available-fees amount) err-insufficient-balance)
    (map-set asset-fees 'STX (- available-fees amount))
    (try! (as-contract (stx-transfer? amount tx-sender contract-owner)))
    (print {event: "fee-withdrawal", asset: 'STX, amount: amount, recipient: contract-owner})
    (ok amount)))

;; Owner function to withdraw accumulated SIP010 token fees
(define-public (owner-withdraw-sip010-fees (token <sip010-trait>) (amount uint))
  (let ((asset (contract-of token))
        (available-fees (get-asset-fees asset)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= available-fees amount) err-insufficient-balance)
    (map-set asset-fees asset (- available-fees amount))
    (try! (as-contract (contract-call? token transfer amount tx-sender contract-owner none)))
    (print {event: "fee-withdrawal", asset: asset, amount: amount, recipient: contract-owner})
    (ok amount)))

(define-read-only (get-asset-balance (user principal) (asset principal))
  (default-to u0 (map-get? asset-balances {user: user, asset: asset})))

(define-read-only (get-asset-fees (asset principal))
  (default-to u0 (map-get? asset-fees asset)))

(define-read-only (is-asset-supported (asset principal))
  (default-to false (map-get? supported-assets asset)))