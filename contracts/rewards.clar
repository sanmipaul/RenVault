;; Rewards Contract - Manages commitment point rewards and bonuses
(define-constant err-no-rewards (err u400))
(define-constant err-already-claimed (err u401))

(define-data-var reward-pool uint u0)
(define-map user-rewards principal uint)
(define-map claimed-rewards principal bool)
(define-map milestone-rewards uint uint) ;; points -> reward amount

(define-public (add-to-reward-pool (amount uint))
  (begin
    (var-set reward-pool (+ (var-get reward-pool) amount))
    (ok true)
  )
)

(define-public (claim-milestone-reward (points uint))
  (let (
    (reward-amount (default-to u0 (map-get? milestone-rewards points)))
    (already-claimed (default-to false (map-get? claimed-rewards tx-sender)))
  )
    (asserts! (> reward-amount u0) err-no-rewards)
    (asserts! (not already-claimed) err-already-claimed)
    
    (map-set claimed-rewards tx-sender true)
    (map-set user-rewards tx-sender reward-amount)
    (ok reward-amount)
  )
)

(define-public (set-milestone-reward (points uint) (reward uint))
  (begin
    (map-set milestone-rewards points reward)
    (ok true)
  )
)

(define-read-only (get-reward-pool)
  (ok (var-get reward-pool)))

(define-read-only (get-user-rewards (user principal))
  (ok (default-to u0 (map-get? user-rewards user))))