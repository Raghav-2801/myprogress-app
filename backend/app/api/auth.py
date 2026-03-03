from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Literal

from ..core.config import get_settings
from ..core.security import verify_password, create_access_token
from ..db.session import get_db
from ..models.user import User
from ..schemas.user import LoginRequest, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint with cat emoji themed authentication.
    
    - "kapil" + correct password = Admin access
    - "friend" + any password = Guest/Read-only access
    """
    settings = get_settings()
    
    # Check if it's the admin
    if login_data.username.lower() == settings.ADMIN_USERNAME:
        if not verify_password(login_data.password, settings.ADMIN_PASSWORD_HASH):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get or create admin user
        user = db.query(User).filter(User.username == "kapil").first()
        if not user:
            user = User(
                username="kapil",
                is_admin=True,
                is_guest=False
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "is_admin": True},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    
    # Check if it's a friend (guest)
    elif login_data.username.lower() in ["friend", "guest", "buddy"]:
        # Create or get guest user
        guest_username = f"guest_{login_data.username.lower()}"
        user = db.query(User).filter(User.username == guest_username).first()
        if not user:
            user = User(
                username=guest_username,
                is_admin=False,
                is_guest=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.username, "is_admin": False, "is_guest": True},
            expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username. Are you Kapil 🐱 or a friend?",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(security)):
    """Get current logged-in user info"""
    return current_user


@router.post("/guest", response_model=Token)
def create_guest_session(db: Session = Depends(get_db)):
    """Create a guest session for friends"""
    import uuid
    from datetime import datetime
    
    guest_username = f"guest_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"
    
    user = User(
        username=guest_username,
        is_admin=False,
        is_guest=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    settings = get_settings()
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "is_admin": False, "is_guest": True},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )
