from django.conf import settings

def global_variables(request):
    is_tenant = request.tenant.schema_name != "public"

    context = {
        "LOCAL_DEVELOPMENT": settings.LOCAL_DEVELOPMENT,
        "PROJECT_NAME": settings.PROJECT_NAME,
    }

    if is_tenant:
        pass

    return context