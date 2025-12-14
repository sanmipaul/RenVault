;; RenVault - Clarity 4 Micro-Savings & Reputation Protocol
;; A decentralized vault for STX deposits with commitment points and protocol fees

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-invalid-amount (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-transfer-failed (err u103))

;; Data Variables
(define-data-var total-fees-collected uint u0)

;; Data Maps (Clarity 4 typed maps)
(define-map user-balances principal uint)
(define-map commitment-points principal uint)

;; Private Functions
(define-private (calculate-fee (amount uint))
  (/ amount u100)) ;; 1% fee

(define-private (calculate-user-amount (amount uint))
  (- amount (calculate-fee amount)))

;; Public Functions

;; Deposit STX into vault with fee collection and commitment points
(define-public (deposit (amount uint))
  (let (
    (sender tx-sender)
    (fee (calculate-fee amount))
    (user-amount (calculate-user-amount amount))
    (current-balance (default-to u0 (map-get? user-balances sender)))
    (current-points (default-to u0 (map-get? commitment-points sender)))
  )
    ;; Validate amount
    (asserts! (> amount u0) err-invalid-amount)
    
    ;; Transfer STX from user to contract
    (try! (stx-transfer? amount sender (as-contract tx-sender)))
    
    ;; Update user balance (99% of deposit)
    (map-set user-balances sender (+ current-balance user-amount))
    
    ;; Increment commitment points (Clarity 4 arithmetic)
    (map-set commitment-points sender (+ current-points u1))
    
    ;; Add fee to total collected
    (var-set total-fees-collected (+ (var-get total-fees-collected) fee))
    
    (ok {
      deposited: user-amount,
      fee: fee,
      new-balance: (+ current-balance user-amount),
      commitment-points: (+ current-points u1)
    })
  )
)

;; Withdraw STX from vault
(define-public (withdraw (amount uint))
  (let (
    (sender tx-sender)
    (current-balance (default-to u0 (map-get? user-balances sender)))
  )
    ;; Validate amount
    (asserts! (> amount u0) err-invalid-amount)
    (asserts! (>= current-balance amount) err-insufficient-balance)
    
    ;; Update user balance
    (map-set user-balances sender (- current-balance amount))
    
    ;; Transfer STX from contract to user
    (as-contract (stx-transfer? amount tx-sender sender))
  )
)

;; Owner withdraws accumulated fees
(define-public (owner-withdraw-fees)
  (let (
    (fees (var-get total-fees-collected))
  )
    ;; Only contract owner can withdraw fees
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> fees u0) err-invalid-amount)
    
    ;; Reset fees to zero
    (var-set total-fees-collected u0)
    
    ;; Transfer fees to owner
    (as-contract (stx-transfer? fees tx-sender contract-owner))
  )
)

;; Read-only Functions (Clarity 4 optional returns)

;; Get user's vault balance
(define-read-only (get-balance (user principal))
  (ok (default-to u0 (map-get? user-balances user)))
)

;; Get user's commitment points
(define-read-only (get-points (user principal))
  (ok (default-to u0 (map-get? commitment-points user)))
)

;; Get total fees collected
(define-read-only (get-fees-collected)
  (ok (var-get total-fees-collected))
)

;; Get contract owner
(define-read-only (get-contract-owner)
  (ok contract-owner)
)

;; Get user stats (balance and points)
(define-read-only (get-user-stats (user principal))
  (ok {
    balance: (default-to u0 (map-get? user-balances user)),
    points: (default-to u0 (map-get? commitment-points user))
  })
)