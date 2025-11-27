# core/core/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

class SerializadorUsuario(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Cria o usuário de forma segura (com hash na senha)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user