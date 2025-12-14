;; Emergency Contract - Circuit breaker and emergency functions
(define-constant err-not-emergency-admin (err u800))
(define-constant err-protocol-paused (err u801))

(define-data-var emergency-admin principal tx-sender)
(define-data-var protocol-paused bool false)
(define-data-var emergency-withdrawal-enabled bool false)

(define-map emergency-contacts principal bool)

(define-public (pause-protocol)
  (begin
    (asserts! (is-eq tx-sender (var-get emergency-admin)) err-not-emergency-admin)
    (var-set protocol-paused true)
    (ok true)
  )
)

(define-public (unpause-protocol)
  (begin
    (asserts! (is-eq tx-sender (var-get emergency-admin)) err-not-emergency-admin)
    (var-set protocol-paused false)
    (ok true)
  )
)

(define-public (enable-emergency-withdrawal)
  (begin
    (asserts! (is-eq tx-sender (var-get emergency-admin)) err-not-emergency-admin)
    (var-set emergency-withdrawal-enabled true)
    (ok true)
  )
)

(define-public (add-emergency-contact (contact principal))
  (begin
    (asserts! (is-eq tx-sender (var-get emergency-admin)) err-not-emergency-admin)
    (map-set emergency-contacts contact true)
    (ok true)
  )
)

(define-read-only (is-protocol-paused)
  (ok (var-get protocol-paused)))

(define-read-only (is-emergency-withdrawal-enabled)
  (ok (var-get emergency-withdrawal-enabled)))

(define-read-only (is-emergency-contact (contact principal))
  (ok (default-to false (map-get? emergency-contacts contact))))