;; NFT Rewards Contract
(impl-trait .sip009-nft-trait.nft-trait)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-token-exists (err u102))

(define-non-fungible-token achievement-badge uint)
(define-data-var last-token-id uint u0)

;; Token metadata
(define-map token-metadata uint {
  name: (string-ascii 50),
  description: (string-ascii 200),
  image: (string-utf8 200),
  achievement-type: (string-ascii 20)
})

;; Achievement requirements
(define-map achievement-requirements (string-ascii 20) {
  min-deposits: uint,
  min-amount: uint,
  min-commitment: uint
})

;; User achievements
(define-map user-achievements principal (list 10 (string-ascii 20)))

;; Initialize achievements
(map-set achievement-requirements "first-deposit" {min-deposits: u1, min-amount: u0, min-commitment: u0})
(map-set achievement-requirements "whale" {min-deposits: u0, min-amount: u100000000, min-commitment: u0})
(map-set achievement-requirements "diamond-hands" {min-deposits: u10, min-amount: u0, min-commitment: u100})

;; Mint achievement NFT
(define-public (mint-achievement (recipient principal) (achievement-type (string-ascii 20)))
  (let ((token-id (+ (var-get last-token-id) u1)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (nft-mint? achievement-badge token-id recipient))
    (var-set last-token-id token-id)
    (map-set token-metadata token-id {
      name: achievement-type,
      description: "RenVault Achievement Badge",
      image: "https://renvault.com/badges/",
      achievement-type: achievement-type
    })
    (ok token-id)))

;; Check and award achievements
(define-public (check-achievements (user principal) (deposits uint) (total-amount uint) (commitment uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (if (and (>= deposits u1) (not (has-achievement user "first-deposit")))
        (try! (award-achievement user "first-deposit")) true)
    (if (and (>= total-amount u100000000) (not (has-achievement user "whale")))
        (try! (award-achievement user "whale")) true)
    (if (and (>= commitment u100) (not (has-achievement user "diamond-hands")))
        (try! (award-achievement user "diamond-hands")) true)
    (ok true)))

(define-private (award-achievement (user principal) (achievement (string-ascii 20)))
  (let ((current-achievements (default-to (list) (map-get? user-achievements user))))
    (map-set user-achievements user (unwrap! (as-max-len? (append current-achievements achievement) u10) (err u103)))
    (mint-achievement user achievement)))

(define-private (has-achievement (user principal) (achievement (string-ascii 20)))
  (let ((achievements (default-to (list) (map-get? user-achievements user))))
    (is-some (index-of achievements achievement))))

;; SIP009 implementation
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id)))

(define-read-only (get-token-uri (token-id uint))
  (ok (some (concat (get image (unwrap! (map-get? token-metadata token-id) (err u404))) (uint-to-ascii token-id)))))

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? achievement-badge token-id)))

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (nft-transfer? achievement-badge token-id sender recipient)))

(define-read-only (get-user-achievements (user principal))
  (default-to (list) (map-get? user-achievements user)))