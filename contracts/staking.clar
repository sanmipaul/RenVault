;; Staking Contract - Stake commitment points for additional rewards
(define-constant err-insufficient-points (err u900))
(define-constant err-not-staked (err u901))

(define-data-var total-staked uint u0)
(define-data-var reward-rate uint u5) ;; 5% APY

(define-map staked-points principal uint)
(define-map stake-timestamp principal uint)
(define-map earned-rewards principal uint)

(define-public (stake-points (points uint))
  (let (
    (current-staked (default-to u0 (map-get? staked-points tx-sender)))
  )
    (map-set staked-points tx-sender (+ current-staked points))
    (map-set stake-timestamp tx-sender block-height)
    (var-set total-staked (+ (var-get total-staked) points))
    (ok true)
  )
)

(define-public (unstake-points (points uint))
  (let (
    (current-staked (default-to u0 (map-get? staked-points tx-sender)))
  )
    (asserts! (>= current-staked points) err-insufficient-points)
    
    (map-set staked-points tx-sender (- current-staked points))
    (var-set total-staked (- (var-get total-staked) points))
    (ok true)
  )
)

(define-public (claim-staking-rewards)
  (let (
    (staked (default-to u0 (map-get? staked-points tx-sender)))
    (stake-time (default-to u0 (map-get? stake-timestamp tx-sender)))
    (blocks-staked (- block-height stake-time))
    (rewards (/ (* staked blocks-staked (var-get reward-rate)) u52560)) ;; Approximate blocks per year
  )
    (asserts! (> staked u0) err-not-staked)
    
    (map-set earned-rewards tx-sender rewards)
    (map-set stake-timestamp tx-sender block-height)
    (ok rewards)
  )
)

(define-read-only (get-staked-points (user principal))
  (ok (default-to u0 (map-get? staked-points user))))

(define-read-only (get-earned-rewards (user principal))
  (ok (default-to u0 (map-get? earned-rewards user))))

(define-read-only (get-total-staked)
  (ok (var-get total-staked)))