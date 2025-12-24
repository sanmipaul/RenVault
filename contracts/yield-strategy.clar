;; Automated Yield Strategy Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-insufficient-balance (err u402))
(define-constant err-strategy-paused (err u403))
(define-constant err-invalid-oracle (err u404))

;; Strategy state
(define-data-var strategy-paused bool false)
(define-data-var total-staked uint u0)
(define-data-var reward-rate uint u100) ;; Base rate: 1% per cycle
(define-data-var oracle-contract principal .oracle)

;; User stakes and rewards
(define-map user-stakes principal uint)
(define-map user-rewards principal uint)
(define-map strategy-allocations principal {staking: uint, liquidity: uint, lending: uint})

;; Stake assets for yield farming
(define-public (stake-for-yield (amount uint))
  (let ((current-stake (default-to u0 (map-get? user-stakes tx-sender))))
    (asserts! (not (var-get strategy-paused)) err-strategy-paused)
    (asserts! (> amount u0) (err u400))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set user-stakes tx-sender (+ current-stake amount))
    (var-set total-staked (+ (var-get total-staked) amount))
    (ok amount)))

;; Unstake assets
(define-public (unstake (amount uint))
  (let ((current-stake (default-to u0 (map-get? user-stakes tx-sender))))
    (asserts! (>= current-stake amount) err-insufficient-balance)
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (map-set user-stakes tx-sender (- current-stake amount))
    (var-set total-staked (- (var-get total-staked) amount))
    (ok amount)))

;; Calculate and distribute rewards
(define-public (distribute-rewards)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (ok (calculate-rewards))))

(define-private (calculate-rewards)
  (let ((total (var-get total-staked))
        (base-rate (var-get reward-rate))
        (price-data (contract-call? .oracle get-stx-price)))
    (match price-data
       price (let ((dynamic-rate (if (> price u100) (+ base-rate u50) base-rate)))
               (/ (* total dynamic-rate) u10000))
       error u0)))

;; Allocate to different strategies
(define-public (set-allocation (staking uint) (liquidity uint) (lending uint))
  (let ((total (+ (+ staking liquidity) lending)))
    (asserts! (is-eq total u100) (err u400))
    (map-set strategy-allocations tx-sender {staking: staking, liquidity: liquidity, lending: lending})
    (ok true)))

(define-public (update-oracle (new-oracle principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set oracle-contract new-oracle)
    (ok true)))

(define-read-only (get-user-stake (user principal))
  (default-to u0 (map-get? user-stakes user)))

(define-read-only (get-user-rewards (user principal))
  (default-to u0 (map-get? user-rewards user)))

(define-read-only (get-total-staked)
  (var-get total-staked))
