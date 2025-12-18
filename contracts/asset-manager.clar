;; Asset Manager Contract
(use-trait sip010 .sip010-trait.sip010-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-asset (err u101))

(define-map asset-registry principal {name: (string-ascii 32), decimals: uint, active: bool})
(define-map user-asset-balances {user: principal, asset: principal} uint)

(define-public (register-asset (asset <sip010>) (name (string-ascii 32)) (decimals uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set asset-registry (contract-of asset) {name: name, decimals: decimals, active: true}))))

(define-public (deposit-sip010 (asset <sip010>) (amount uint))
  (let ((asset-contract (contract-of asset))
        (current-balance (get-user-balance tx-sender asset-contract)))
    (try! (contract-call? asset transfer amount tx-sender (as-contract tx-sender) none))
    (map-set user-asset-balances {user: tx-sender, asset: asset-contract} (+ current-balance amount))
    (ok amount)))

(define-public (withdraw-sip010 (asset <sip010>) (amount uint))
  (let ((asset-contract (contract-of asset))
        (balance (get-user-balance tx-sender asset-contract)))
    (asserts! (>= balance amount) (err u102))
    (map-set user-asset-balances {user: tx-sender, asset: asset-contract} (- balance amount))
    (as-contract (contract-call? asset transfer amount tx-sender tx-sender none))))

(define-read-only (get-user-balance (user principal) (asset principal))
  (default-to u0 (map-get? user-asset-balances {user: user, asset: asset})))

(define-read-only (get-asset-info (asset principal))
  (map-get? asset-registry asset))