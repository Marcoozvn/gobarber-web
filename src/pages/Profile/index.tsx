import React, { ChangeEvent, useCallback, useRef } from 'react';
import { FiMail, FiUser, FiLock, FiArrowLeft, FiCamera } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';
import api from '../../services/api';
import { useToast } from '../../hooks/toast';

import { Container, Content, AvatarInput } from './styles';

import Input from '../../components/Input';
import Button from '../../components/Button';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';

interface SignUpFormData {
  name: string;
  email: string;
  old_password: string;
  password: string;
  password_confirmation: string;
}

const Profile: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const history = useHistory();

  const handleSubmit = useCallback(async (data: SignUpFormData) => {
    try {
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        name: Yup.string().required('Nome obrigatório'),
        email: Yup.string().required('Email obrigatório').email('Digite um email válido'),
        old_password: Yup.string(),
        password: Yup.string().when('old_password', {
          is: (val: string | any[]) => !!val.length,
          then: Yup.string().required('Campo obrigatório'),
          otherwise: Yup.string()
        }),
        password_confirmation: Yup.string().when('old_password', {
          is: (val: string | any[]) => !!val.length,
          then: Yup.string().required('Campo obrigatório'),
          otherwise: Yup.string()
        }).oneOf(
          [Yup.ref('password'), null],
          'Confirmação incorreta'
        )
      });

      const formData = {
        name: data.name,
        email: data.email,
        ...(data.old_password ?
          {
            old_password: data.old_password,
            password: data.password,
            password_confirmation: data.password_confirmation
          }
          : {})
      }

      await schema.validate(data, { abortEarly: false });

      const response = await api.put('/profile', formData);

      updateUser(response.data);

      history.push('/dashboard');

      addToast({
        type: 'success',
        title: 'Perfil atualizado!',
        description: 'Suas informações de perfil foram atualizadas.'
      });

      history.push('/');
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = getValidationErrors(error);

        formRef.current?.setErrors(errors);
      } else {

        addToast({
          type: 'error',
          title: 'Erro na atualização',
          description: 'Ocorreu um erro ao atualizar o perfil, tente novamente'
        });
      }
    }
  }, [addToast, history, updateUser]);

  const handleAvatarChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const data = new FormData();

      data.append('avatar', e.target.files[0]);

      api.patch('/users/avatar', data).then((response) => {
        updateUser(response.data);
        addToast({
          type: 'success',
          title: 'Avatar atualizado!'
        });
      })
    }
  }, [addToast, updateUser])

  return (
    <Container>
      <header>
        <div>
          <Link to="/dashboard">
            <FiArrowLeft />
          </Link>
        </div>
      </header>

      <Content>

        <Form
          initialData={{
            name: user.name, email: user.email
          }}
          onSubmit={handleSubmit}
          ref={formRef}>

          <AvatarInput>
            <img src={user.avatar_url} alt={user.name} />
            <label htmlFor="avatar">
              <FiCamera />
              <input type="file" id="avatar" onChange={handleAvatarChange} />
            </label>
          </AvatarInput>

          <h1>Meu Perfil</h1>

          <Input icon={FiUser} name="name" placeholder="Nome" />
          <Input icon={FiMail} name="email" placeholder="Email" />

          <Input icon={FiLock}
            name="old_password"
            placeholder="Senha atual"
            type="password"
            containerStyle={{ marginTop: 24 }}
          />

          <Input
            icon={FiLock}
            name="password"
            placeholder="Nova senha"
            type="password" />

          <Input
            icon={FiLock}
            name="password_confirmation"
            placeholder="Confirmar senha"
            type="password" />
          <Button type="submit">Confirmar mudanças</Button>
        </Form>


      </Content>
    </Container>
  );
}

export default Profile;