;; Staking Rewards Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-insufficient-balance (err u402))
(define-constant err-no-stake (err u403))

;; Staking data
(define-map user-stakes principal uint)
(define-map user-rewards principal uint)
(define-map stake-timestamps principal uint)

;; Staking parameters
(define-data-var total-staked uint u0)
(define-data-var reward-rate uint u100) ;; 1% per epoch
(define-data-var min-stake uint u1000000) ;; 1 STX minimum
(define-data-var lock-period uint u144) ;; 1 day in blocks
;; Reward pool — funded by owner to back claimable rewards
(define-data-var reward-pool uint u0)

;; Stake STX
(define-public (stake (amount uint))
  (begin
    (asserts! (>= amount (var-get min-stake)) (err u404))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    (let ((current-stake (default-to u0 (map-get? user-stakes tx-sender))))
      (map-set user-stakes tx-sender (+ current-stake amount))
      (map-set stake-timestamps tx-sender block-height)
      (var-set total-staked (+ (var-get total-staked) amount))
      (ok amount))))

;; Unstake STX
(define-public (unstake (amount uint))
  (let ((sender tx-sender)
        (current-stake (default-to u0 (map-get? user-stakes tx-sender)))
        (stake-time (default-to u0 (map-get? stake-timestamps tx-sender))))
    (asserts! (> amount u0) (err u408))
    (asserts! (>= current-stake amount) err-insufficient-balance)
    (asserts! (>= (- block-height stake-time) (var-get lock-period)) (err u405))
    ;; State updates before external call (CEI pattern)
    (map-set user-stakes sender (- current-stake amount))
    (var-set total-staked (- (var-get total-staked) amount))
    ;; Transfer from contract to caller — sender captured before as-contract
    (try! (as-contract (stx-transfer? amount tx-sender sender)))
    (ok amount)))

;; Calculate rewards
(define-public (calculate-rewards (user principal))
  (let ((stake (default-to u0 (map-get? user-stakes user)))
        (stake-time (default-to u0 (map-get? stake-timestamps user))))
    (if (> stake u0)
      (let ((epochs-staked (/ (- block-height stake-time) u144))
            (reward (/ (* stake (var-get reward-rate) epochs-staked) u10000)))
        (ok reward))
      (ok u0))))

;; Claim rewards — transfers STX from reward pool to user
(define-public (claim-rewards)
  (let ((sender tx-sender)
        (rewards-result (unwrap! (calculate-rewards tx-sender) (err u406))))
    (asserts! (> rewards-result u0) (err u407))
    (asserts! (>= (var-get reward-pool) rewards-result) (err u410))
    ;; Update state before transfer (CEI pattern)
    (map-set user-rewards sender (+ (default-to u0 (map-get? user-rewards sender)) rewards-result))
    (map-set stake-timestamps sender block-height)
    (var-set reward-pool (- (var-get reward-pool) rewards-result))
    ;; Pay out rewards to the caller
    (try! (as-contract (stx-transfer? rewards-result tx-sender sender)))
    (ok rewards-result)))

;; Owner deposits STX to fund reward payouts
(define-public (fund-reward-pool (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (> amount u0) (err u409))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set reward-pool (+ (var-get reward-pool) amount))
    (ok amount)))

;; Set staking parameters
(define-public (set-reward-rate (rate uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set reward-rate rate)
    (ok true)))

(define-public (set-min-stake (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set min-stake amount)
    (ok true)))

;; Read functions
(define-read-only (get-user-stake (user principal))
  (default-to u0 (map-get? user-stakes user)))

(define-read-only (get-user-rewards (user principal))
  (default-to u0 (map-get? user-rewards user)))

(define-read-only (get-total-staked)
  (var-get total-staked))

(define-read-only (get-staking-info)
  {
    total-staked: (var-get total-staked),
    reward-rate: (var-get reward-rate),
    min-stake: (var-get min-stake),
    lock-period: (var-get lock-period)
  })