class BaseGateway:
    """
    Common interface every payment gateway integration must implement.
    Keeping gateways behind this interface means payments/views.py never
    needs to know which provider is in use.
    """

    def create_payment(self, *, amount, order, callback_url):
        """Start a transaction with the provider. Returns (redirect_url, authority_or_token)."""
        raise NotImplementedError

    def verify_payment(self, *, authority_or_token, amount):
        """Verify a completed transaction. Returns (success: bool, ref_id: str, raw_data: dict)."""
        raise NotImplementedError
