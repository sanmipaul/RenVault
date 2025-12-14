;; Vault Factory - Creates and manages multiple vault instances
(define-constant err-unauthorized (err u200))
(define-constant err-vault-exists (err u201))

(define-data-var vault-count uint u0)
(define-map vault-registry uint principal)
(define-map user-vaults principal uint)

(define-public (create-vault)
  (let ((vault-id (+ (var-get vault-count) u1)))
    (var-set vault-count vault-id)
    (map-set vault-registry vault-id tx-sender)
    (map-set user-vaults tx-sender vault-id)
    (ok vault-id)
  )
)

(define-read-only (get-vault-count)
  (ok (var-get vault-count)))

(define-read-only (get-user-vault (user principal))
  (ok (map-get? user-vaults user)))