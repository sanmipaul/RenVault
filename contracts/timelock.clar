;; Timelock Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-not-ready (err u402))
(define-constant err-already-executed (err u403))
(define-constant err-invalid-delay (err u404))

;; Timelock state
(define-data-var min-delay uint u1440) ;; 1 day in blocks
(define-data-var max-delay uint u43200) ;; 30 days in blocks
(define-data-var transaction-counter uint u0)

;; Queued transactions
(define-map queued-transactions uint {
  target: principal,
  function-name: (string-ascii 50),
  args: (list 10 (buff 34)),
  eta: uint,
  executed: bool,
  cancelled: bool
})

;; Queue transaction
(define-public (queue-transaction (target principal) (function-name (string-ascii 50)) (args (list 10 (buff 34))) (delay uint))
  (let ((tx-id (+ (var-get transaction-counter) u1))
        (eta (+ block-height delay)))
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (and (>= delay (var-get min-delay)) (<= delay (var-get max-delay))) err-invalid-delay)
    
    (var-set transaction-counter tx-id)
    (map-set queued-transactions tx-id {
      target: target,
      function-name: function-name,
      args: args,
      eta: eta,
      executed: false,
      cancelled: false
    })
    (ok tx-id)))

;; Execute transaction
(define-public (execute-transaction (tx-id uint))
  (let ((tx-data (unwrap! (map-get? queued-transactions tx-id) (err u404))))
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (>= block-height (get eta tx-data)) err-not-ready)
    (asserts! (not (get executed tx-data)) err-already-executed)
    (asserts! (not (get cancelled tx-data)) (err u405))
    
    (map-set queued-transactions tx-id (merge tx-data {executed: true}))
    (ok true)))

;; Cancel transaction
(define-public (cancel-transaction (tx-id uint))
  (let ((tx-data (unwrap! (map-get? queued-transactions tx-id) (err u404))))
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (not (get executed tx-data)) err-already-executed)
    
    (map-set queued-transactions tx-id (merge tx-data {cancelled: true}))
    (ok true)))

;; Set delays
(define-public (set-min-delay (delay uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set min-delay delay)
    (ok true)))

(define-public (set-max-delay (delay uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set max-delay delay)
    (ok true)))

;; Read functions
(define-read-only (get-transaction (tx-id uint))
  (map-get? queued-transactions tx-id))

(define-read-only (is-ready (tx-id uint))
  (match (map-get? queued-transactions tx-id)
    tx-data (and (>= block-height (get eta tx-data)) (not (get executed tx-data)) (not (get cancelled tx-data)))
    false))

(define-read-only (get-delays)
  {min-delay: (var-get min-delay), max-delay: (var-get max-delay)})

(define-read-only (get-eta (tx-id uint))
  (match (map-get? queued-transactions tx-id)
    tx-data (some (get eta tx-data))
    none))