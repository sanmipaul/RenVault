;; Referral System Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-self-referral (err u402))
(define-constant err-already-referred (err u403))

;; Referral data
(define-map referrals principal principal) ;; user -> referrer
(define-map referral-counts principal uint) ;; referrer -> count
(define-map referral-rewards principal uint) ;; referrer -> total rewards
(define-map user-rewards principal uint) ;; user -> earned rewards

;; Referral settings
(define-data-var referral-bonus uint u50000) ;; 0.05 STX bonus
(define-data-var referrer-commission uint u5) ;; 5% commission

;; Register referral
(define-public (register-referral (referrer principal))
  (begin
    (asserts! (not (is-eq tx-sender referrer)) err-self-referral)
    (asserts! (is-none (map-get? referrals tx-sender)) err-already-referred)
    
    (map-set referrals tx-sender referrer)
    (map-set referral-counts referrer (+ (default-to u0 (map-get? referral-counts referrer)) u1))
    
    ;; Give bonus to new user
    (map-set user-rewards tx-sender (var-get referral-bonus))
    
    (ok true)))

;; Process referral reward
(define-public (process-referral-reward (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    
    (match (map-get? referrals user)
      referrer (begin
        (let ((commission (/ (* amount (var-get referrer-commission)) u100)))
          (map-set referral-rewards referrer (+ (default-to u0 (map-get? referral-rewards referrer)) commission))
          (ok commission)))
      (ok u0))))

;; Claim referral rewards
(define-public (claim-rewards)
  (let ((rewards (default-to u0 (map-get? referral-rewards tx-sender))))
    (asserts! (> rewards u0) (err u404))
    (map-delete referral-rewards tx-sender)
    (try! (as-contract (stx-transfer? rewards tx-sender tx-sender)))
    (ok rewards)))

;; Set referral parameters
(define-public (set-referral-bonus (bonus uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set referral-bonus bonus)
    (ok true)))

(define-public (set-referrer-commission (commission uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (<= commission u20) (err u405)) ;; Max 20%
    (var-set referrer-commission commission)
    (ok true)))

;; Read functions
(define-read-only (get-referrer (user principal))
  (map-get? referrals user))

(define-read-only (get-referral-count (referrer principal))
  (default-to u0 (map-get? referral-counts referrer)))

(define-read-only (get-referral-rewards (referrer principal))
  (default-to u0 (map-get? referral-rewards referrer)))

(define-read-only (get-user-rewards (user principal))
  (default-to u0 (map-get? user-rewards user)))

(define-read-only (get-referral-settings)
  {bonus: (var-get referral-bonus), commission: (var-get referrer-commission)})