(use-trait sip010-trait .sip010-trait.sip010-trait)

;; Contract version
(define-constant contract-version "2.0.0")
(define-constant contract-name "multi-asset-vault")

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-asset-not-supported (err u103))
(define-constant err-transfer-failed (err u104))
(define-constant err-not-authorized (err u105))
(define-constant err-contract-paused (err u106))
(define-constant err-exceeds-max-deposit (err u107))
(define-constant err-below-min-withdrawal (err u108))

;; Contract state
(define-data-var contract-paused bool false)

;; Deposit limits per asset (0 means no limit)
(define-map max-deposit-limits principal uint)
;; Minimum withdrawal amounts per asset (0 means no minimum)
(define-map min-withdrawal-amounts principal uint)

;; Asset registry
(define-map supported-assets principal bool)
(define-map asset-balances {user: principal, asset: principal} uint)
(define-map asset-fees principal uint)
(define-map total-deposits principal uint)

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

;; Set max deposit limit for an asset (0 = no limit)
(define-public (set-max-deposit-limit (asset principal) (limit uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set max-deposit-limits asset limit)
    (print {event: "max-deposit-limit-set", asset: asset, limit: limit})
    (ok limit)))

;; Set minimum withdrawal amount for an asset (0 = no minimum)
(define-public (set-min-withdrawal-amount (asset principal) (min-amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set min-withdrawal-amounts asset min-amount)
    (print {event: "min-withdrawal-amount-set", asset: asset, amount: min-amount})
    (ok min-amount)))

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
        (current-balance (get-asset-balance tx-sender 'STX))
        (max-limit (get-max-deposit-limit 'STX)))
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! (> amount u0) err-invalid-amount)
    ;; Check max deposit limit (0 means no limit)
    (asserts! (or (is-eq max-limit u0) (<= (+ current-balance user-amount) max-limit)) err-exceeds-max-deposit)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set asset-balances {user: tx-sender, asset: 'STX} (+ current-balance user-amount))
    (map-set asset-fees 'STX (+ (get-asset-fees 'STX) fee))
    (map-set total-deposits 'STX (+ (get-total-deposits 'STX) user-amount))
    (print {event: "deposit", user: tx-sender, asset: 'STX, amount: user-amount, fee: fee})
    (ok user-amount)))

(define-public (deposit-sip010 (token <sip010-trait>) (amount uint))
  (let ((asset (contract-of token))
        (is-supported (default-to false (map-get? supported-assets asset)))
        (fee (/ amount u100))
        (user-amount (- amount fee))
        (current-balance (get-asset-balance tx-sender asset))
        (max-limit (get-max-deposit-limit asset)))
    (asserts! (not (var-get contract-paused)) err-contract-paused)
    (asserts! is-supported err-asset-not-supported)
    (asserts! (> amount u0) err-invalid-amount)
    ;; Check max deposit limit (0 means no limit)
    (asserts! (or (is-eq max-limit u0) (<= (+ current-balance user-amount) max-limit)) err-exceeds-max-deposit)
    (try! (contract-call? token transfer amount tx-sender (as-contract tx-sender) none))
    (map-set asset-balances {user: tx-sender, asset: asset} (+ current-balance user-amount))
    (map-set asset-fees asset (+ (get-asset-fees asset) fee))
    (map-set total-deposits asset (+ (get-total-deposits asset) user-amount))
    (print {event: "deposit", user: tx-sender, asset: asset, amount: user-amount, fee: fee})
    (ok user-amount)))

(define-public (withdraw-stx (amount uint))
  (let ((sender tx-sender)
        (balance (get-asset-balance tx-sender 'STX))
        (min-withdrawal (get-min-withdrawal-amount 'STX)))
    (asserts! (> amount u0) err-invalid-amount)
    ;; Check minimum withdrawal (0 means no minimum, or allow full balance withdrawal)
    (asserts! (or (is-eq min-withdrawal u0) (>= amount min-withdrawal) (is-eq amount balance)) err-below-min-withdrawal)
    (asserts! (>= balance amount) err-insufficient-balance)
    (map-set asset-balances {user: sender, asset: 'STX} (- balance amount))
    (map-set total-deposits 'STX (- (get-total-deposits 'STX) amount))
    ;; Transfer from contract to the user (sender captured before as-contract)
    (try! (as-contract (stx-transfer? amount tx-sender sender)))
    (print {event: "withdrawal", user: sender, asset: 'STX, amount: amount})
    (ok true)))

(define-public (withdraw-sip010 (token <sip010-trait>) (amount uint))
  (let ((sender tx-sender)
        (asset (contract-of token))
        (balance (get-asset-balance tx-sender asset))
        (min-withdrawal (get-min-withdrawal-amount asset)))
    (asserts! (> amount u0) err-invalid-amount)
    ;; Check minimum withdrawal (0 means no minimum, or allow full balance withdrawal)
    (asserts! (or (is-eq min-withdrawal u0) (>= amount min-withdrawal) (is-eq amount balance)) err-below-min-withdrawal)
    (asserts! (>= balance amount) err-insufficient-balance)
    (map-set asset-balances {user: sender, asset: asset} (- balance amount))
    (map-set total-deposits asset (- (get-total-deposits asset) amount))
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

;; Emergency withdraw all STX balance for a user
(define-public (emergency-withdraw-stx)
  (let ((sender tx-sender)
        (balance (get-asset-balance tx-sender 'STX)))
    (asserts! (> balance u0) err-insufficient-balance)
    (map-set asset-balances {user: sender, asset: 'STX} u0)
    (map-set total-deposits 'STX (- (get-total-deposits 'STX) balance))
    (try! (as-contract (stx-transfer? balance tx-sender sender)))
    (print {event: "emergency-withdrawal", user: sender, asset: 'STX, amount: balance})
    (ok balance)))

;; Emergency withdraw all token balance for a user
(define-public (emergency-withdraw-sip010 (token <sip010-trait>))
  (let ((sender tx-sender)
        (asset (contract-of token))
        (balance (get-asset-balance tx-sender asset)))
    (asserts! (> balance u0) err-insufficient-balance)
    (map-set asset-balances {user: sender, asset: asset} u0)
    (map-set total-deposits asset (- (get-total-deposits asset) balance))
    (try! (as-contract (contract-call? token transfer balance tx-sender sender none)))
    (print {event: "emergency-withdrawal", user: sender, asset: asset, amount: balance})
    (ok balance)))

(define-read-only (get-asset-balance (user principal) (asset principal))
  (default-to u0 (map-get? asset-balances {user: user, asset: asset})))

(define-read-only (get-asset-fees (asset principal))
  (default-to u0 (map-get? asset-fees asset)))

(define-read-only (is-asset-supported (asset principal))
  (default-to false (map-get? supported-assets asset)))

(define-read-only (get-total-deposits (asset principal))
  (default-to u0 (map-get? total-deposits asset)))

(define-read-only (get-max-deposit-limit (asset principal))
  (default-to u0 (map-get? max-deposit-limits asset)))

(define-read-only (get-min-withdrawal-amount (asset principal))
  (default-to u0 (map-get? min-withdrawal-amounts asset)))

;; Contract info
(define-read-only (get-contract-version)
  contract-version)

(define-read-only (get-contract-name)
  contract-name)

(define-read-only (get-contract-owner)
  contract-owner)

;; Helper function to get user's STX balance
(define-read-only (get-stx-balance (user principal))
  (get-asset-balance user 'STX))

;; Helper function to get total STX in vault
(define-read-only (get-total-stx-deposits)
  (get-total-deposits 'STX))

;; Helper function to get accumulated STX fees
(define-read-only (get-stx-fees)
  (get-asset-fees 'STX))

;; Get contract summary for an asset
(define-read-only (get-asset-summary (asset principal))
  {
    supported: (is-asset-supported asset),
    total-deposits: (get-total-deposits asset),
    total-fees: (get-asset-fees asset),
    max-deposit-limit: (get-max-deposit-limit asset),
    min-withdrawal: (get-min-withdrawal-amount asset)
  })

;; Get user summary for an asset
(define-read-only (get-user-asset-summary (user principal) (asset principal))
  {
    balance: (get-asset-balance user asset),
    max-deposit-limit: (get-max-deposit-limit asset),
    min-withdrawal: (get-min-withdrawal-amount asset),
    contract-paused: (is-paused)
  })