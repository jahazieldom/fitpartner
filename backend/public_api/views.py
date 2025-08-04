from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django_tenants.utils import schema_context
from django.contrib.auth.hashers import make_password, check_password
from tenants.models import Company, UserCompany
from public_api.serializers import AppUserDetailSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from api.serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes, authentication_classes

User = get_user_model()

class RegisterUserCompany(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        schema = request.data.get("schema")

        if not all([email, password, schema]):
            return Response({"detail": "Faltan campos obligatorios"}, status=400)
        
        if not Company.objects.filter(schema_name=schema).exists():
            return Response({"detail": "Tenant inválido"}, status=400)

        if UserCompany.objects.filter(user_email=email, company_schema_name=schema).exists():
            return Response({"detail": "Ya existe ese usuario en ese tenant"}, status=400)

        # Crear usuario en el esquema del tenant
        try:
            with schema_context(schema):
                serializer = RegisterSerializer(data=request.data)

                if serializer.is_valid():
                    tenant_client_obj = serializer.save() 
                    app_user_data = AppUserDetailSerializer(
                        UserCompany.objects.get(
                            user_email=email, 
                            company_schema_name=schema
                        )
                    ).data
                    return Response({
                        "detail": "Usuario creado correctamente",
                        "instance": app_user_data,
                    }, status=status.HTTP_201_CREATED)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"detail": f"Error al crear usuario en tenant: {str(e)}"}, status=500)

        return Response({"detail": "Usuario creado correctamente"}, status=201)

class LoginUserCompany(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not all([email, password]):
            return Response({"detail": "Faltan campos obligatorios"}, status=400)

        try:
            user_company = UserCompany.objects.get(user_email=email)
        except UserCompany.DoesNotExist:
            return Response({"detail": "Credenciales inválidas"}, status=401)


        with schema_context(user_company.company_schema_name):
            user = user_company.user_obj
            if not user:
                return Response({"detail": "Usuario no encontrado en el tenant"}, status=404)

            if not user.check_password(password):
                return Response({"detail": "Credenciales inválidas (tenant)"}, status=401)
            
            user_company.last_login = timezone.now()
            user_company.save()

            app_user_data = AppUserDetailSerializer(user_company).data
            return Response({
                "detail": "Login exitoso",
                "instance": app_user_data,
            }, status=200)


@api_view(['POST'])
@permission_classes([])
@authentication_classes([])
def validate_email(request):
    email = request.data.get("email")
    if not email:
        return Response({
            "status": "error",
            "message": "Email no fué especificado"
        })
    
    exists = UserCompany.objects.filter(user_email__iexact=email).first()
    if exists:
        return Response({
            "status": "error",
            "message": f"Ya existe un usuario con el email {email}"
        })

    return Response({
        "status": "success",
        "message": "Email válido"
    })

@api_view(['GET'])
@permission_classes([])
@authentication_classes([])
def companies(request):
    data = []

    for company in Company.objects.all().exclude(schema_name="public"):
        data.append({
            "schema_name": company.schema_name,
            "name": company.name,
            "logo": "https://placehold.co/500x300",
        })

    return Response({
        "status": "success",
        "companies": data,
    })
    