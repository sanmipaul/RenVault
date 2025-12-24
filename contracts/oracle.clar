;; Oracle Price Feed Contract
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u401))
(define-constant err-stale-price (err u402))
(define-constant err-invalid-price (err u403))

;; Price data
(define-map price-feeds (string-ascii 10) {
  price: uint,
  timestamp: uint,
  decimals: uint,
  source: (string-ascii 20)
})

;; Oracle operators
(define-map oracle-operators principal bool)
(define-data-var price-staleness-threshold uint u3600) ;; 1 hour

;; Initialize owner as operator
(map-set oracle-operators contract-owner true)

;; Update price feed
(define-public (update-price (symbol (string-ascii 10)) (price uint) (decimals uint) (source (string-ascii 20)))
  (begin
    (asserts! (default-to false (map-get? oracle-operators tx-sender)) err-unauthorized)
    (asserts! (> price u0) err-invalid-price)
    (map-set price-feeds symbol {
      price: price,
      timestamp: block-height,
      decimals: decimals,
      source: source
    })
    (ok true)))

;; Get price feed
(define-read-only (get-price (symbol (string-ascii 10)))
  (let ((feed (unwrap! (map-get? price-feeds symbol) (err u404))))
    (asserts! (< (- block-height (get timestamp feed)) (var-get price-staleness-threshold)) err-stale-price)
    (ok (get price feed))))

;; Get price with timestamp
(define-read-only (get-price-data (symbol (string-ascii 10)))
  (map-get? price-feeds symbol))

;; Add oracle operator
(define-public (add-oracle-operator (operator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set oracle-operators operator true)
    (ok true)))

;; Remove oracle operator
(define-public (remove-oracle-operator (operator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-delete oracle-operators operator)
    (ok true)))

;; Set staleness threshold
(define-public (set-staleness-threshold (threshold uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set price-staleness-threshold threshold)
    (ok true)))

;; Check if price is fresh
(define-read-only (is-price-fresh (symbol (string-ascii 10)))
  (match (map-get? price-feeds symbol)
    feed (< (- block-height (get timestamp feed)) (var-get price-staleness-threshold))
    false))

;; Get multiple prices
(define-read-only (get-prices (symbols (list 5 (string-ascii 10))))
  (map get-price-data symbols))

(define-read-only (is-oracle-operator (operator principal))
  (default-to false (map-get? oracle-operators operator)))