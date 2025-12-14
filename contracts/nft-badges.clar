;; NFT Badges Contract - Achievement badges for commitment milestones
(impl-trait .sip009-nft-trait.nft-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u500))
(define-constant err-not-token-owner (err u501))
(define-constant err-token-exists (err u502))

(define-non-fungible-token commitment-badge uint)
(define-data-var last-token-id uint u0)

(define-map token-metadata uint {name: (string-ascii 50), description: (string-ascii 200), image: (string-ascii 200)})
(define-map milestone-badges uint uint) ;; commitment points -> badge token id

(define-public (mint-badge (recipient principal) (points uint) (name (string-ascii 50)) (description (string-ascii 200)) (image (string-ascii 200)))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    
    (try! (nft-mint? commitment-badge token-id recipient))
    (var-set last-token-id token-id)
    
    (map-set token-metadata token-id {name: name, description: description, image: image})
    (map-set milestone-badges points token-id)
    
    (ok token-id)
  )
)

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some (get image (unwrap! (map-get? token-metadata token-id) (err u404))))))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? commitment-badge token-id)))

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? commitment-badge token-id sender recipient)
  )
)