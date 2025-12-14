;; Vault Trait - Interface definition for vault contracts
;; Defines standard functions that vault implementations should provide

(define-trait vault-trait
  (
    ;; Core vault operations
    (deposit (uint) (response {deposited: uint, fee: uint, new-balance: uint, commitment-points: uint} uint))
    (withdraw (uint) (response bool uint))
    
    ;; Read-only functions
    (get-balance (principal) (response uint uint))
    (get-points (principal) (response uint uint))
    (get-fees-collected () (response uint uint))
    (get-contract-owner () (response principal uint))
  )
)