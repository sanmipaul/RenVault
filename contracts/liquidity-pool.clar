;; Liquidity Pool Contract
;; Automated Market Maker with fee collection

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-invalid-amount (err u102))
(define-constant err-pool-not-found (err u103))

(define-map pools 
  { token-a: principal, token-b: principal }
  { 
    reserve-a: uint, 
    reserve-b: uint, 
    total-supply: uint,
    fee-rate: uint
  })

(define-map user-liquidity 
  { user: principal, token-a: principal, token-b: principal }
  uint)


(define-public (create-pool (token-a principal) (token-b principal) (amount-a uint) (amount-b uint))
  (let ((pool-key { token-a: token-a, token-b: token-b }))
    (asserts! (is-none (map-get? pools pool-key)) err-pool-not-found)
    (map-set pools pool-key {
      reserve-a: amount-a,
      reserve-b: amount-b,
      total-supply: (* amount-a amount-b),
      fee-rate: u30
    })
    (print {event: "create-pool", token-a: token-a, token-b: token-b, amount-a: amount-a, amount-b: amount-b, by: tx-sender})
    (ok true)))


(define-public (add-liquidity (token-a principal) (token-b principal) (amount-a uint) (amount-b uint))
  (let ((pool-key { token-a: token-a, token-b: token-b })
        (pool (unwrap! (map-get? pools pool-key) err-pool-not-found)))
    (map-set user-liquidity 
      { user: tx-sender, token-a: token-a, token-b: token-b }
      (+ (default-to u0 (map-get? user-liquidity { user: tx-sender, token-a: token-a, token-b: token-b })) amount-a))
    (print {event: "add-liquidity", user: tx-sender, token-a: token-a, token-b: token-b, amount-a: amount-a, amount-b: amount-b})
    (ok true)))

(define-read-only (get-pool (token-a principal) (token-b principal))
  (map-get? pools { token-a: token-a, token-b: token-b }))

(define-read-only (get-user-liquidity (user principal) (token-a principal) (token-b principal))
  (default-to u0 (map-get? user-liquidity { user: user, token-a: token-a, token-b: token-b })))