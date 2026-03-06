;; Rewards Contract - Manages commitment point rewards and bonuses

;; --- Constants ---
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u402))
(define-constant err-no-rewards (err u400))
(define-constant err-already-claimed (err u401))
(define-constant err-invalid-amount (err u403))
(define-constant err-insufficient-pool (err u404))

;; --- State ---
(define-data-var reward-pool uint u0)
(define-map user-rewards principal uint)
;; Tracks claimed milestones per user per point threshold
(define-map claimed-milestones {user: principal, points: uint} bool)
(define-map milestone-rewards uint uint) ;; points -> reward amount

;; --- Owner-only functions ---

;; Add STX to the reward pool; only the contract owner may call this.
(define-public (add-to-reward-pool (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (> amount u0) err-invalid-amount)
    (var-set reward-pool (+ (var-get reward-pool) amount))
    (ok true)
  )
)

;; Set the STX reward for a specific commitment-points milestone.
;; Only the contract owner may configure milestones.
(define-public (set-milestone-reward (points uint) (reward uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set milestone-rewards points reward)
    (ok true)
  )
)

;; --- Public functions ---

;; Claim the reward for a specific points milestone.
;; Each user may claim each milestone exactly once.
(define-public (claim-milestone-reward (points uint))
  (let (
    (reward-amount (default-to u0 (map-get? milestone-rewards points)))
    (already-claimed (default-to false (map-get? claimed-milestones {user: tx-sender, points: points})))
    (pool (var-get reward-pool))
  )
    (asserts! (> reward-amount u0) err-no-rewards)
    (asserts! (not already-claimed) err-already-claimed)
    (asserts! (>= pool reward-amount) err-insufficient-pool)

    (map-set claimed-milestones {user: tx-sender, points: points} true)
    (map-set user-rewards tx-sender (+ (default-to u0 (map-get? user-rewards tx-sender)) reward-amount))
    (var-set reward-pool (- pool reward-amount))
    (ok reward-amount)
  )
)

;; --- Read-only functions ---

(define-read-only (get-reward-pool)
  (ok (var-get reward-pool)))

(define-read-only (get-user-rewards (user principal))
  (ok (default-to u0 (map-get? user-rewards user))))

(define-read-only (get-milestone-reward (points uint))
  (ok (default-to u0 (map-get? milestone-rewards points))))

(define-read-only (has-claimed-milestone (user principal) (points uint))
  (ok (default-to false (map-get? claimed-milestones {user: user, points: points}))))

(define-read-only (get-contract-owner)
  (ok contract-owner))

;; ---------------------------------------------------------------------------
;; CHANGELOG
;; ---------------------------------------------------------------------------
;; v2 (this revision):
;;   - set-milestone-reward: guarded by (is-eq tx-sender contract-owner)
;;   - add-to-reward-pool:   guarded by (is-eq tx-sender contract-owner)
;;                           also validates amount > 0
;;   - claimed-rewards map:  REPLACED by claimed-milestones keyed on
;;                           {user principal, points uint}.  The old boolean
;;                           per-user flag meant a user who claimed one
;;                           milestone could never claim another.
;;   - claim-milestone-reward: pool balance is decremented on each successful
;;                             claim; insufficient pool balance is rejected
;;                             with err-insufficient-pool (u404)
;;   - New read-only helpers: get-milestone-reward, has-claimed-milestone,
;;                            get-contract-owner
;; ---------------------------------------------------------------------------
