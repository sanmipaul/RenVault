;; Vault Factory - Creates and manages multiple vault instances

;; --- Constants ---
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u200))
(define-constant err-vault-exists (err u201))
(define-constant err-vault-not-found (err u202))

;; --- State ---
(define-data-var vault-count uint u0)

;; vault-id -> owner principal
(define-map vault-registry uint principal)

;; owner principal -> vault-id
(define-map user-vaults principal uint)

;; vault-id -> metadata tuple
(define-map vault-metadata uint {created-at: uint, owner: principal})

;; --- Public functions ---

;; Create a new vault for tx-sender.
;; Each principal may own at most one vault; calling a second time returns
;; err-vault-exists (u201) instead of silently overwriting the mapping.
(define-public (create-vault)
  (begin
    ;; Reject if the caller already owns a vault.
    (asserts! (is-none (map-get? user-vaults tx-sender)) err-vault-exists)

    (let ((vault-id (+ (var-get vault-count) u1)))
      (var-set vault-count vault-id)
      (map-set vault-registry vault-id tx-sender)
      (map-set user-vaults tx-sender vault-id)
      (map-set vault-metadata vault-id {created-at: block-height, owner: tx-sender})
      (ok vault-id)
    )
  )
)

;; Owner-only: delete a vault entry (e.g. after contract migration).
;; Clears both lookup maps but does NOT adjust vault-count.
(define-public (remove-vault (vault-id uint))
  (let ((owner (unwrap! (map-get? vault-registry vault-id) err-vault-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-delete vault-registry vault-id)
    (map-delete user-vaults owner)
    (map-delete vault-metadata vault-id)
    (ok true)
  )
)

;; --- Read-only functions ---

(define-read-only (get-vault-count)
  (ok (var-get vault-count)))

(define-read-only (get-user-vault (user principal))
  (ok (map-get? user-vaults user)))

(define-read-only (get-vault-owner (vault-id uint))
  (ok (map-get? vault-registry vault-id)))

(define-read-only (get-vault-metadata (vault-id uint))
  (ok (map-get? vault-metadata vault-id)))

(define-read-only (has-vault (user principal))
  (ok (is-some (map-get? user-vaults user))))

(define-read-only (get-contract-owner)
  (ok contract-owner))
