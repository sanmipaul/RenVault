;; Analytics Contract
(define-constant contract-owner tx-sender)

;; Analytics data maps
(define-map daily-stats uint {deposits: uint, withdrawals: uint, users: uint})
(define-map user-activity principal {deposits: uint, withdrawals: uint, last-active: uint})

;; Current day counter
(define-data-var current-day uint u0)

;; Record deposit analytics
(define-public (record-deposit (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u401))
    (update-daily-deposits amount)
    (update-user-activity user amount true)
    (ok true)))

;; Record withdrawal analytics  
(define-public (record-withdrawal (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) (err u401))
    (update-daily-withdrawals amount)
    (update-user-activity user amount false)
    (ok true)))

(define-private (update-daily-deposits (amount uint))
  (let ((day (var-get current-day))
        (stats (default-to {deposits: u0, withdrawals: u0, users: u0} 
                           (map-get? daily-stats day))))
    (map-set daily-stats day 
             {deposits: (+ (get deposits stats) amount),
              withdrawals: (get withdrawals stats),
              users: (get users stats)})))

(define-private (update-daily-withdrawals (amount uint))
  (let ((day (var-get current-day))
        (stats (default-to {deposits: u0, withdrawals: u0, users: u0} 
                           (map-get? daily-stats day))))
    (map-set daily-stats day 
             {deposits: (get deposits stats),
              withdrawals: (+ (get withdrawals stats) amount),
              users: (get users stats)})))

(define-private (update-user-activity (user principal) (amount uint) (is-deposit bool))
  (let ((activity (default-to {deposits: u0, withdrawals: u0, last-active: u0}
                              (map-get? user-activity user))))
    (map-set user-activity user
             {deposits: (if is-deposit (+ (get deposits activity) amount) (get deposits activity)),
              withdrawals: (if is-deposit (get withdrawals activity) (+ (get withdrawals activity) amount)),
              last-active: block-height})))

(define-read-only (get-daily-stats (day uint))
  (map-get? daily-stats day))

(define-read-only (get-user-activity (user principal))
  (map-get? user-activity user))