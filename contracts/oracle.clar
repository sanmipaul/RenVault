;; Oracle Contract - External data feeds for dynamic fee calculation
(define-constant err-unauthorized (err u600))
(define-constant err-stale-data (err u601))

(define-data-var stx-price uint u100000) ;; Price in cents
(define-data-var last-update uint u0)
(define-data-var oracle-admin principal tx-sender)

(define-map authorized-oracles principal bool)

(define-public (update-price (new-price uint))
  (begin
    (asserts! (default-to false (map-get? authorized-oracles tx-sender)) err-unauthorized)
    (var-set stx-price new-price)
    (var-set last-update block-height)
    (ok true)
  )
)

(define-public (add-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get oracle-admin)) err-unauthorized)
    (map-set authorized-oracles oracle true)
    (ok true)
  )
)

(define-public (remove-oracle (oracle principal))
  (begin
    (asserts! (is-eq tx-sender (var-get oracle-admin)) err-unauthorized)
    (map-delete authorized-oracles oracle)
    (ok true)
  )
)

(define-read-only (get-stx-price)
  (ok (var-get stx-price)))

(define-read-only (get-last-update)
  (ok (var-get last-update)))

(define-read-only (is-oracle-authorized (oracle principal))
  (ok (default-to false (map-get? authorized-oracles oracle))))