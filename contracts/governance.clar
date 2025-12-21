;; Governance Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-proposal-not-found (err u404))
(define-constant err-voting-ended (err u405))

;; Governance state
(define-data-var proposal-counter uint u0)
(define-data-var voting-period uint u1440) ;; 1440 blocks (~1 day)

;; Proposals
(define-map proposals uint {
  proposer: principal,
  title: (string-ascii 100),
  description: (string-ascii 500),
  votes-for: uint,
  votes-against: uint,
  end-block: uint,
  executed: bool
})

(define-map user-votes {proposal-id: uint, voter: principal} bool)
(define-map voting-power principal uint)

;; Create proposal
(define-public (create-proposal (title (string-ascii 100)) (description (string-ascii 500)))
  (let ((proposal-id (+ (var-get proposal-counter) u1)))
    (var-set proposal-counter proposal-id)
    (map-set proposals proposal-id {
      proposer: tx-sender,
      title: title,
      description: description,
      votes-for: u0,
      votes-against: u0,
      end-block: (+ block-height (var-get voting-period)),
      executed: false
    })
    (ok proposal-id)))

;; Vote on proposal
(define-public (vote (proposal-id uint) (support bool))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found))
        (power (default-to u1 (map-get? voting-power tx-sender))))
    (asserts! (< block-height (get end-block proposal)) err-voting-ended)
    (asserts! (is-none (map-get? user-votes {proposal-id: proposal-id, voter: tx-sender})) (err u406))
    
    (map-set user-votes {proposal-id: proposal-id, voter: tx-sender} support)
    
    (if support
      (map-set proposals proposal-id (merge proposal {votes-for: (+ (get votes-for proposal) power)}))
      (map-set proposals proposal-id (merge proposal {votes-against: (+ (get votes-against proposal) power)})))
    
    (ok true)))

;; Execute proposal
(define-public (execute-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-proposal-not-found)))
    (asserts! (>= block-height (get end-block proposal)) (err u407))
    (asserts! (not (get executed proposal)) (err u408))
    (asserts! (> (get votes-for proposal) (get votes-against proposal)) (err u409))
    
    (map-set proposals proposal-id (merge proposal {executed: true}))
    (ok true)))

;; Set voting power
(define-public (set-voting-power (user principal) (power uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set voting-power user power)
    (ok true)))

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id))

(define-read-only (get-voting-power (user principal))
  (default-to u1 (map-get? voting-power user)))