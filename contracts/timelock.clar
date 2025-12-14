;; Timelock Contract - Time-locked withdrawals for enhanced security
(define-constant err-withdrawal-locked (err u700))
(define-constant err-invalid-timelock (err u701))

(define-data-var default-timelock uint u144) ;; ~24 hours in blocks

(define-map withdrawal-requests {user: principal, request-id: uint} {amount: uint, unlock-height: uint, executed: bool})
(define-map user-request-count principal uint)

(define-public (request-withdrawal (amount uint))
  (let (
    (request-count (default-to u0 (map-get? user-request-count tx-sender)))
    (request-id (+ request-count u1))
    (unlock-height (+ block-height (var-get default-timelock)))
  )
    (map-set withdrawal-requests {user: tx-sender, request-id: request-id} 
      {amount: amount, unlock-height: unlock-height, executed: false})
    (map-set user-request-count tx-sender request-id)
    (ok request-id)
  )
)

(define-public (execute-withdrawal (request-id uint))
  (let (
    (request (unwrap! (map-get? withdrawal-requests {user: tx-sender, request-id: request-id}) err-invalid-timelock))
  )
    (asserts! (>= block-height (get unlock-height request)) err-withdrawal-locked)
    (asserts! (not (get executed request)) err-invalid-timelock)
    
    (map-set withdrawal-requests {user: tx-sender, request-id: request-id} 
      (merge request {executed: true}))
    (ok (get amount request))
  )
)

(define-public (set-timelock (new-timelock uint))
  (begin
    (var-set default-timelock new-timelock)
    (ok true)
  )
)

(define-read-only (get-withdrawal-request (user principal) (request-id uint))
  (ok (map-get? withdrawal-requests {user: user, request-id: request-id})))

(define-read-only (get-timelock)
  (ok (var-get default-timelock)))