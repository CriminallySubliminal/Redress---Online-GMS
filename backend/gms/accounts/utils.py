from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse

signer = TimestampSigner()

def send_verification_email(user):
    # Generate token containing the user's ID
    token = signer.sign(str(user.id))
    
    # Construct verification link
    # Using localhost:5173 for the frontend as specified in settings
    frontend_url = 'http://localhost:5173'
    verification_link = f"{frontend_url}/verify-email?token={token}"
    
    subject = "Verify your Email Address - GMS"
    message = f"Hello {user.username},\n\nPlease click the link below to verify your email address:\n{verification_link}\n\nThis link will expire in 30 minutes."
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )

def verify_token(token, max_age=1800):
    # 1800 seconds = 30 minutes
    try:
        user_id = signer.unsign(token, max_age=max_age)
        return user_id
    except SignatureExpired:
        return 'expired'
    except BadSignature:
        return 'invalid'
