from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserCompany
from tenants.models import Company

# Inline para asignar compañías al usuario
class UserCompanyInline(admin.TabularInline):
    model = UserCompany
    extra = 1
    # autocomplete_fields = ['company']  # útil si hay muchas compañías
    

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Mostrar compañías relacionadas en el formulario del usuario
    inlines = [UserCompanyInline]

    # Listado de usuarios
    list_display = ("username", "email", "first_name", "last_name", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")

    # Organización del formulario de edición
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "email", "phone")}),
        (_("Permissions"), {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )

    # Campos mostrados al crear un nuevo usuario
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2"),
        }),
    )
