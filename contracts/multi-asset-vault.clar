;; Multi-Asset Vault Contract
;; Supports STX and SIP-010 tokens

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-asset-not-supported (err u103))

;; Asset registry
(define-map supported-assets principal bool)
(define-map asset-balances {user: principal, asset: principal} uint)
(define-map asset-fees principal uint)

;; Initialize STX as supported asset
(map-set supported-assets 'STX true)

(define-public (add-supported-asset (asset principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set supported-assets asset true))))

(define-public (deposit-asset (asset principal) (amount uint))
  (let ((is-supported (default-to false (map-get? supported-assets asset))))
    (asserts! is-supported err-asset-not-supported)
    (asserts! (> amount u0) err-invalid-amount)
    (if (is-eq asset 'STX)
        (deposit-stx amount)
        (deposit-token asset amount))))

(define-private (deposit-stx (amount uint))
  (let ((fee (/ amount u100))
        (user-amount (- amount fee))
        (current-balance (get-asset-balance tx-sender 'STX)))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set asset-balances {user: tx-sender, asset: 'STX} (+ current-balance user-amount))
    (map-set asset-fees 'STX (+ (get-asset-fees 'STX) fee))
    (ok user-amount)))

(define-private (deposit-token (asset principal) (amount uint))
  (let ((fee (/ amount u100))
        (user-amount (- amount fee))
        (current-balance (get-asset-balance tx-sender asset)))
    (map-set asset-balances {user: tx-sender, asset: asset} (+ current-balance user-amount))
    (map-set asset-fees asset (+ (get-asset-fees asset) fee))
    (ok user-amount)))

(define-public (withdraw-asset (asset principal) (amount uint))
  (let ((balance (get-asset-balance tx-sender asset)))
    (asserts! (>= balance amount) err-insufficient-balance)
    (map-set asset-balances {user: tx-sender, asset: asset} (- balance amount))
    (if (is-eq asset 'STX)
        (as-contract (stx-transfer? amount tx-sender tx-sender))
        (ok true))))

(define-read-only (get-asset-balance (user principal) (asset principal))
  (default-to u0 (map-get? asset-balances {user: user, asset: asset})))

(define-read-only (get-asset-fees (asset principal))
  (default-to u0 (map-get? asset-fees asset)))

(define-read-only (is-asset-supported (asset principal))
  (default-to false (map-get? supported-assets asset)))