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

;; Stake STX
(define-public (stake (amount uint))
  (begin
    (asserts! (>= amount (var-get min-stake)) (err u404))
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (let ((current-stake (default-to u0 (map-get? user-stakes tx-sender))))
      (map-set user-stakes tx-sender (+ current-stake amount))
      (map-set stake-timestamps tx-sender block-height)
      (var-set total-staked (+ (var-get total-staked) amount))
      (print {event: "stake", user: tx-sender, amount: amount, new-stake: (+ current-stake amount)})
      (ok amount))))

;; Unstake STX
(define-public (unstake (amount uint))
  (let ((current-stake (default-to u0 (map-get? user-stakes tx-sender)))
        (stake-time (default-to u0 (map-get? stake-timestamps tx-sender))))
    (asserts! (>= current-stake amount) err-insufficient-balance)
    (asserts! (>= (- block-height stake-time) (var-get lock-period)) (err u405))
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (map-set user-stakes tx-sender (- current-stake amount))
    (var-set total-staked (- (var-get total-staked) amount))
    (print {event: "unstake", user: tx-sender, amount: amount, new-stake: (- current-stake amount)})
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

;; Claim rewards
(define-public (claim-rewards)
  (let ((rewards-result (unwrap! (calculate-rewards tx-sender) (err u406))))
    (asserts! (> rewards-result u0) (err u407))
    (map-set user-rewards tx-sender (+ (default-to u0 (map-get? user-rewards tx-sender)) rewards-result))
    (map-set stake-timestamps tx-sender block-height)
    (print {event: "claim-rewards", user: tx-sender, amount: rewards-result})
    (ok rewards-result)))

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