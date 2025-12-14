;; Referral Contract - Referral system with bonus rewards
(define-constant err-self-referral (err u1000))
(define-constant err-already-referred (err u1001))

(define-data-var referral-bonus uint u50) ;; 0.5% bonus
(define-data-var total-referrals uint u0)

(define-map referrals principal principal) ;; user -> referrer
(define-map referral-count principal uint)
(define-map referral-earnings principal uint)

(define-public (set-referrer (referrer principal))
  (begin
    (asserts! (not (is-eq tx-sender referrer)) err-self-referral)
    (asserts! (is-none (map-get? referrals tx-sender)) err-already-referred)
    
    (map-set referrals tx-sender referrer)
    (map-set referral-count referrer (+ (default-to u0 (map-get? referral-count referrer)) u1))
    (var-set total-referrals (+ (var-get total-referrals) u1))
    (ok true)
  )
)

(define-public (process-referral-bonus (user principal) (deposit-amount uint))
  (match (map-get? referrals user)
    referrer (let (
      (bonus (/ (* deposit-amount (var-get referral-bonus)) u10000))
      (current-earnings (default-to u0 (map-get? referral-earnings referrer)))
    )
      (map-set referral-earnings referrer (+ current-earnings bonus))
      (ok bonus)
    )
    (ok u0)
  )
)

(define-public (claim-referral-earnings)
  (let (
    (earnings (default-to u0 (map-get? referral-earnings tx-sender)))
  )
    (map-set referral-earnings tx-sender u0)
    (ok earnings)
  )
)

(define-read-only (get-referrer (user principal))
  (ok (map-get? referrals user)))

(define-read-only (get-referral-count (referrer principal))
  (ok (default-to u0 (map-get? referral-count referrer))))

(define-read-only (get-referral-earnings (referrer principal))
  (ok (default-to u0 (map-get? referral-earnings referrer))))

(define-read-only (get-total-referrals)
  (ok (var-get total-referrals)))