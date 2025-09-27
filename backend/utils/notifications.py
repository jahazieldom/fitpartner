import os
from exponent_server_sdk import PushClient, PushMessage, DeviceNotRegisteredError, PushServerError, PushTicketError
from .models import ClientPushToken  
from django.conf import settings


def send_push_notification(user, title, body, data=None):
    """
    Envía una notificación push a un usuario usando el SDK de Expo.

    Args:
        user: instancia del usuario Django.
        title: título de la notificación.
        body: cuerpo de la notificación.
        data: diccionario opcional con información extra.
    
    Returns:
        dict con el resultado del envío o error.
    """
    try:
        token_obj = ClientPushToken.objects.get(user=user)
        token = token_obj.token
    except ClientPushToken.DoesNotExist:
        return {"error": "Usuario no tiene token de Expo"}

    client = PushClient(access_token=settings.EXPO_ACCESS_TOKEN)

    message = PushMessage(
        to=token,
        title=title,
        body=body,
        data=data or {},
        sound="default",
    )

    try:
        response = client.publish(message)
        response.validate_response()  # Lanza excepción si algo falla
        return {"success": True, "response": response.to_dict()}
    except DeviceNotRegisteredError:
        # Token inválido, borramos para que no vuelva a intentar
        token_obj.delete()
        return {"error": "Token no válido, eliminado de la base de datos"}
    except (PushServerError, PushTicketError) as exc:
        # Otros errores del servidor o en el ticket
        return {"error": str(exc)}
    except Exception as exc:
        # Cualquier otro error inesperado
        return {"error": str(exc)}
