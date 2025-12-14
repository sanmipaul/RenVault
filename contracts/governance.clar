;; Governance Contract - Protocol parameter management
(define-constant err-not-authorized (err u300))
(define-constant err-invalid-proposal (err u301))

(define-data-var fee-rate uint u100) ;; 1%
(define-data-var min-deposit uint u1000)
(define-data-var proposal-count uint u0)

(define-map proposals uint {proposer: principal, fee-rate: uint, votes: uint, executed: bool})
(define-map votes {proposal-id: uint, voter: principal} bool)

(define-public (propose-fee-change (new-fee-rate uint))
  (let ((proposal-id (+ (var-get proposal-count) u1)))
    (var-set proposal-count proposal-id)
    (map-set proposals proposal-id {proposer: tx-sender, fee-rate: new-fee-rate, votes: u0, executed: false})
    (ok proposal-id)
  )
)

(define-public (vote (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-invalid-proposal)))
    (map-set votes {proposal-id: proposal-id, voter: tx-sender} true)
    (map-set proposals proposal-id (merge proposal {votes: (+ (get votes proposal) u1)}))
    (ok true)
  )
)

(define-read-only (get-fee-rate)
  (ok (var-get fee-rate)))

(define-read-only (get-proposal (proposal-id uint))
  (ok (map-get? proposals proposal-id)))