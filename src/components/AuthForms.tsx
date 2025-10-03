// src/components/AuthForms.tsx - Login and Registration forms

import React, { useState } from "react";
import { z } from "zod";

import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";

import { useForm, Input, validationSchemas } from "./FormComponents";

// Validation schemas
const loginSchema = z.object({
  email: validationSchemas.email,
  password: validationSchemas.required,
});

const registerSchema = z
  .object({
    firstName: validationSchemas.required,
    lastName: validationSchemas.required,
    email: validationSchemas.email,
    password: validationSchemas.password,
    confirmPassword: validationSchemas.password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface AuthFormsProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [error, setError] = useState<string>("");

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleSubmit,
  } = useForm<LoginFormData>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (formData) => {
      try {
        setError("");
        await login(formData.email, formData.password);
        logger.info("Login successful");
        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        logger.error("Login error:", err);
      }
    },
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Sign In
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={values.email}
          onChange={(value) => setValue("email", value)}
          onBlur={(field) => setFieldTouched(field)}
          error={errors.email}
          touched={touched.email}
          required
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={values.password}
          onChange={(value) => setValue("password", value)}
          onBlur={(field) => setFieldTouched(field)}
          error={errors.password}
          touched={touched.password}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export const RegisterForm: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const { register } = useAuth();
  const [error, setError] = useState<string>("");

  const {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    handleSubmit,
  } = useForm<RegisterFormData>({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (formData) => {
      try {
        setError("");
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        });
        logger.info("Registration successful");
        onSuccess?.();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Registration failed";
        setError(errorMessage);
        logger.error("Registration error:", err);
      }
    },
  });

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Create Account
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            label="First Name"
            placeholder="John"
            value={values.firstName}
            onChange={(value) => setValue("firstName", value)}
            onBlur={(field) => setFieldTouched(field)}
            error={errors.firstName}
            touched={touched.firstName}
            required
          />

          <Input
            name="lastName"
            label="Last Name"
            placeholder="Doe"
            value={values.lastName}
            onChange={(value) => setValue("lastName", value)}
            onBlur={(field) => setFieldTouched(field)}
            error={errors.lastName}
            touched={touched.lastName}
            required
          />
        </div>

        <Input
          name="email"
          type="email"
          label="Email Address"
          placeholder="john@example.com"
          value={values.email}
          onChange={(value) => setValue("email", value)}
          onBlur={(field) => setFieldTouched(field)}
          error={errors.email}
          touched={touched.email}
          required
        />

        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          helpText="At least 8 characters"
          value={values.password}
          onChange={(value) => setValue("password", value)}
          onBlur={(field) => setFieldTouched(field)}
          error={errors.password}
          touched={touched.password}
          required
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          value={values.confirmPassword}
          onChange={(value) => setValue("confirmPassword", value)}
          onBlur={(field) => setFieldTouched(field)}
          error={errors.confirmPassword}
          touched={touched.confirmPassword}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Creating account...
            </div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
};

export const AuthTabs: React.FC<AuthFormsProps> = ({ onSuccess }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  return (
    <div className="max-w-md mx-auto">
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "login"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("register")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === "register"
              ? "bg-white text-gray-900 shadow"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "login" ? (
        <LoginForm onSuccess={onSuccess} />
      ) : (
        <RegisterForm onSuccess={onSuccess} />
      )}
    </div>
  );
};
