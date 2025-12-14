;; Analytics Contract - Tracks protocol metrics and statistics
(define-data-var total-deposits uint u0)
(define-data-var total-withdrawals uint u0)
(define-data-var unique-users uint u0)
(define-data-var total-volume uint u0)

(define-map daily-stats uint {deposits: uint, withdrawals: uint, volume: uint})
(define-map user-activity principal {deposits: uint, withdrawals: uint, last-activity: uint})

(define-public (record-deposit (user principal) (amount uint))
  (let (
    (current-activity (default-to {deposits: u0, withdrawals: u0, last-activity: u0} (map-get? user-activity user)))
    (block-height (unwrap-panic (get-block-info? height (- block-height u1))))
  )
    (var-set total-deposits (+ (var-get total-deposits) u1))
    (var-set total-volume (+ (var-get total-volume) amount))
    
    (map-set user-activity user {
      deposits: (+ (get deposits current-activity) u1),
      withdrawals: (get withdrawals current-activity),
      last-activity: block-height
    })
    (ok true)
  )
)

(define-public (record-withdrawal (user principal) (amount uint))
  (let (
    (current-activity (default-to {deposits: u0, withdrawals: u0, last-activity: u0} (map-get? user-activity user)))
    (block-height (unwrap-panic (get-block-info? height (- block-height u1))))
  )
    (var-set total-withdrawals (+ (var-get total-withdrawals) u1))
    
    (map-set user-activity user {
      deposits: (get deposits current-activity),
      withdrawals: (+ (get withdrawals current-activity) u1),
      last-activity: block-height
    })
    (ok true)
  )
)

(define-read-only (get-protocol-stats)
  (ok {
    total-deposits: (var-get total-deposits),
    total-withdrawals: (var-get total-withdrawals),
    unique-users: (var-get unique-users),
    total-volume: (var-get total-volume)
  })
)

(define-read-only (get-user-activity (user principal))
  (ok (map-get? user-activity user)))