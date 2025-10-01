import React from "react";
import { useOrderStore } from "../../storages/orderStorage";
import { useForm } from "react-hook-form";

interface FormData {
  firstname: string;
  surname: string;
  email: string;
  phone?: string;
  street?: string;
  number?: string;
  city?: string;
  postcode?: string;
}

export const PersonalDataState = () => {
  const { orderData, updatePersonalData, setCurrentState, _hasHydrated } =
    useOrderStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      firstname: "",
      surname: "",
      email: "",
      phone: "",
      street: "",
      number: "",
      city: "",
      postcode: "",
    },
  });

  React.useEffect(() => {
    if (_hasHydrated) {
      reset({
        firstname: orderData.personalData.firstname,
        surname: orderData.personalData.surname,
        email: orderData.personalData.email,
        phone: orderData.personalData.phone ?? "",
        street: orderData.personalData.street ?? "",
        number: orderData.personalData.number ?? "",
        city: orderData.personalData.city ?? "",
        postcode: orderData.personalData.postcode ?? "",
      });
    }
  }, [_hasHydrated, orderData.personalData, reset]);

  const handleBack = () => {
    setCurrentState("deliveryPayment");
  };

  const onSubmit = (data: FormData) => {
    updatePersonalData(data);
    setCurrentState("summary");
  };

  if (!_hasHydrated) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Načítání formuláře...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-8">Osobní údaje</h2>

      <div className="max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Kontaktní údaje</h3>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="firstname"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Jméno *
                </label>
                <input
                  type="text"
                  id="firstname"
                  {...register("firstname", {
                    required: "Jméno je povinné",
                    minLength: {
                      value: 2,
                      message: "Jméno musí mít alespoň 2 znaky",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstname ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Vaše jméno"
                />
                {errors.firstname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstname.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="surname"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Příjmení *
                </label>
                <input
                  type="text"
                  id="surname"
                  {...register("surname", {
                    required: "Příjmení je povinné",
                    minLength: {
                      value: 2,
                      message: "Příjmení musí mít alespoň 2 znaky",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.surname ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Vaše příjmení"
                />
                {errors.surname && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.surname.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email je povinný",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Neplatný formát emailu",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="vas@email.cz"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  {...register("phone", {
                    pattern: {
                      value: /^[+]?[0-9\s-()]{9,}$/,
                      message: "Neplatný formát telefonu",
                    },
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+420 123 456 789"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {orderData.delivery === "balikovna-adresa" && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Doručovací adresa</h3>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ulice *
                  </label>
                  <input
                    type="text"
                    id="street"
                    {...register("street", {
                      required: "Ulice je povinná",
                      minLength: {
                        value: 2,
                        message: "Ulice musí mít alespoň 2 znaky",
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.street ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Název ulice"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Číslo popisné *
                  </label>
                  <input
                    type="text"
                    id="number"
                    {...register("number", {
                      required: "Číslo popisné je povinné",
                      minLength: {
                        value: 1,
                        message: "Číslo popisné je povinné",
                      },
                    })}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.number ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Číslo popisné"
                  />
                  {errors.number && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.number.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Město *
                    </label>
                    <input
                      type="text"
                      id="city"
                      {...register("city", {
                        required: "Město je povinné",
                        minLength: {
                          value: 2,
                          message: "Město musí mít alespoň 2 znaky",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Město"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="postcode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      PSČ *
                    </label>
                    <input
                      type="text"
                      id="postcode"
                      {...register("postcode", {
                        required: "PSČ je povinné",
                        pattern: {
                          value: /^\d{5}$/,
                          message: "PSČ musí mít 5 číslic",
                        },
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.postcode ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="12345"
                      maxLength={5}
                    />
                    {errors.postcode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.postcode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={handleBack}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Zpět
        </button>
        <button
          onClick={handleSubmit(onSubmit)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Pokračovat k shrnutí
        </button>
      </div>
    </div>
  );
};
