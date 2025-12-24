;; Emergency Pause Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-already-paused (err u402))
(define-constant err-not-paused (err u403))

;; Emergency state
(define-data-var emergency-paused bool false)
(define-data-var pause-reason (string-ascii 100) "")
(define-data-var pause-timestamp uint u0)

;; Emergency contacts
(define-map emergency-contacts principal bool)
(define-map pause-history uint {reason: (string-ascii 100), timestamp: uint, duration: uint})
(define-data-var pause-counter uint u0)

;; Initialize emergency contacts
(map-set emergency-contacts contract-owner true)

;; Emergency pause
(define-public (emergency-pause (reason (string-ascii 100)))
  (begin
    (asserts! (default-to false (map-get? emergency-contacts tx-sender)) err-unauthorized)
    (asserts! (not (var-get emergency-paused)) err-already-paused)
    (var-set emergency-paused true)
    (var-set pause-reason reason)
    (var-set pause-timestamp block-height)
    (log-pause-event reason)
    (ok true)))

;; Resume operations
(define-public (resume-operations)
  (let ((pause-duration (- block-height (var-get pause-timestamp))))
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (var-get emergency-paused) err-not-paused)
    (var-set emergency-paused false)
    (var-set pause-reason "")
    (log-resume-event pause-duration)
    (ok pause-duration)))

;; Add emergency contact
(define-public (add-emergency-contact (contact principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set emergency-contacts contact true)
    (ok true)))

;; Remove emergency contact
(define-public (remove-emergency-contact (contact principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-delete emergency-contacts contact)
    (ok true)))

;; Check if operations are paused
(define-read-only (is-paused)
  (var-get emergency-paused))

;; Get pause details
(define-read-only (get-pause-info)
  {
    paused: (var-get emergency-paused),
    reason: (var-get pause-reason),
    timestamp: (var-get pause-timestamp),
    duration: (if (var-get emergency-paused) (- block-height (var-get pause-timestamp)) u0)
  })

;; Check if address is emergency contact
(define-read-only (is-emergency-contact (contact principal))
  (default-to false (map-get? emergency-contacts contact)))

;; Private functions
(define-private (log-pause-event (reason (string-ascii 100)))
  (let ((counter (+ (var-get pause-counter) u1)))
    (var-set pause-counter counter)
    (map-set pause-history counter {
      reason: reason,
      timestamp: block-height,
      duration: u0
    })
    counter))

(define-private (log-resume-event (duration uint))
  (let ((counter (var-get pause-counter)))
    (match (map-get? pause-history counter)
      entry (map-set pause-history counter (merge entry {duration: duration}))
      false)
    counter))