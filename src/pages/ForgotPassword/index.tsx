import React, { useCallback, useRef, useState } from 'react';
import { FiLogIn, FiMail } from 'react-icons/fi';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

import { Container, Content, Background, AnimationContainer } from './styles';
import logoImg from '../../assets/logo.svg';

import Input from '../../components/Input';
import Button from '../../components/Button';
import { FormHandles } from '@unform/core';
import getValidationErrors from '../../utils/getValidationErrors';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';

interface IForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef<FormHandles>(null);
  const { addToast } = useToast();

  const handleSubmit = useCallback(async (data: IForgotPasswordFormData) => {
    try {
      setLoading(true);
      formRef.current?.setErrors({});

      const schema = Yup.object().shape({
        email: Yup.string().required('Email obrigatório').email('Digite um email válido'),
      });

      await schema.validate(data, { abortEarly: false });

      await api.post('/password/forgot', {
        email: data.email
      });

      addToast({
        type: 'success',
        title: 'E-mail de recuperação enviado',
        description: 'Enviamos um e-mail para recuperação de senha, cheque sua caixa de entrada.'
      });

    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors = getValidationErrors(error);

        formRef.current?.setErrors(errors);
      } else {

        addToast({
          type: 'error',
          title: 'Erro na recuperação de senha',
          description: 'Ocorreu um erro ao tentar realizar a recuperação de senha, tente novamente.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <img src={logoImg} alt="GoBarber" />

          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Recuperar senha</h1>
            <Input icon={FiMail} name="email" placeholder="Email" />
            <Button loading={loading} type="submit">Recuperar</Button>
          </Form>

          <Link to="/">
            <FiLogIn />
            Voltar para o login
          </Link>
        </AnimationContainer>
      </Content>

      <Background />
    </Container>
  );
}

export default ForgotPassword;