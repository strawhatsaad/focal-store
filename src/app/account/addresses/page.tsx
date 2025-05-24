// File: src/app/account/addresses/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import {
  Loader2,
  MapPin,
  ArrowLeft,
  Home,
  PlusCircle,
  Edit3,
  Trash2,
  AlertCircle,
  CheckCircle,
  UserCircle,
} from "lucide-react"; // Added UserCircle
import {
  storeFront,
  GET_CUSTOMER_ADDRESSES_QUERY,
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_ADDRESS_DELETE_MUTATION,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
} from "../../../../utils"; // Adjust path

interface ShopifyAddress {
  id: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  company?: string | null;
  country?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  province?: string | null;
  zip?: string | null;
  formatted?: string[];
}

interface MailingAddressInput {
  address1?: string;
  address2?: string;
  city?: string;
  company?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  province?: string;
  zip?: string;
}

const ManageAddressesPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [defaultAddress, setDefaultAddress] = useState<ShopifyAddress | null>(
    null
  );
  const [otherAddresses, setOtherAddresses] = useState<ShopifyAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShopifyAddress | null>(
    null
  );
  const [formData, setFormData] = useState<MailingAddressInput>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    country: "",
    zip: "",
    phone: "",
    company: "",
  });

  const fetchAddresses = async () => {
    // Ensure shopifyAccessToken is either a string or null
    const token: any = session?.shopifyAccessToken || null;

    if (token) {
      try {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);
        const variables = { customerAccessToken: token };
        // Pass the potentially null token to storeFront
        const response = await storeFront(
          GET_CUSTOMER_ADDRESSES_QUERY,
          variables,
          token
        );

        if (response.data?.customer) {
          setDefaultAddress(response.data.customer.defaultAddress);
          setOtherAddresses(
            response.data.customer.addresses.edges
              .map((edge: any) => edge.node)
              .filter(
                (addr: ShopifyAddress) =>
                  addr.id !== response.data.customer.defaultAddress?.id
              )
          );
        } else if (response.errors) {
          console.error("Shopify API errors:", response.errors);
          setError(
            `Could not fetch addresses. ${response.errors
              .map((e: any) => e.message)
              .join("; ")}`
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch addresses:", err);
        setError(
          err.message || "An error occurred while fetching your addresses."
        );
      } finally {
        setIsLoading(false);
      }
    } else if (
      sessionStatus === "authenticated" &&
      !session?.shopifyAccessToken
    ) {
      setError(
        "Could not authenticate with Shopify to fetch addresses. Access token is missing."
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/api/auth/signin?callbackUrl=/account/addresses");
      return;
    }
    fetchAddresses();
  }, [session, sessionStatus, router]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAddress = async (e: FormEvent) => {
    e.preventDefault();
    const token: any = session?.shopifyAccessToken || null;
    if (!token) {
      setError("Authentication token not found.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;
      if (editingAddress) {
        // Update
        response = await storeFront(
          CUSTOMER_ADDRESS_UPDATE_MUTATION,
          {
            customerAccessToken: token,
            id: editingAddress.id,
            address: formData,
          },
          token
        );
        if (response.data?.customerAddressUpdate?.customerAddress) {
          setSuccessMessage("Address updated successfully!");
        } else {
          throw new Error(
            response.data?.customerAddressUpdate?.customerUserErrors?.[0]
              ?.message || "Failed to update address."
          );
        }
      } else {
        // Create
        response = await storeFront(
          CUSTOMER_ADDRESS_CREATE_MUTATION,
          { customerAccessToken: token, address: formData },
          token
        );
        if (response.data?.customerAddressCreate?.customerAddress) {
          setSuccessMessage("Address added successfully!");
        } else {
          throw new Error(
            response.data?.customerAddressCreate?.customerUserErrors?.[0]
              ?.message || "Failed to add address."
          );
        }
      }
      setShowForm(false);
      setEditingAddress(null);
      setFormData({
        firstName: "",
        lastName: "",
        address1: "",
        address2: "",
        city: "",
        province: "",
        country: "",
        zip: "",
        phone: "",
        company: "",
      });
      fetchAddresses(); // Refresh addresses
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address: ShopifyAddress) => {
    setEditingAddress(address);
    setFormData({
      firstName: address.firstName || "",
      lastName: address.lastName || "",
      address1: address.address1 || "",
      address2: address.address2 || "",
      city: address.city || "",
      province: address.province || "",
      country: address.country || "",
      zip: address.zip || "",
      phone: address.phone || "",
      company: address.company || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteAddress = async (addressId: string) => {
    const token: any = session?.shopifyAccessToken || null;
    if (!token || !confirm("Are you sure you want to delete this address?"))
      return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await storeFront(
        CUSTOMER_ADDRESS_DELETE_MUTATION,
        { customerAccessToken: token, id: addressId },
        token
      );
      if (response.data?.customerAddressDelete?.deletedCustomerAddressId) {
        setSuccessMessage("Address deleted successfully!");
        fetchAddresses(); // Refresh
      } else {
        throw new Error(
          response.data?.customerAddressDelete?.customerUserErrors?.[0]
            ?.message || "Failed to delete address."
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the address.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    const token: any = session?.shopifyAccessToken || null;
    if (!token) return;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await storeFront(
        CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
        { customerAccessToken: token, addressId: addressId },
        token
      );
      if (response.data?.customerDefaultAddressUpdate?.customer) {
        setSuccessMessage("Default address updated successfully!");
        fetchAddresses(); // Refresh addresses
      } else {
        throw new Error(
          response.data?.customerDefaultAddressUpdate?.customerUserErrors?.[0]
            ?.message || "Failed to set default address."
        );
      }
    } catch (err: any) {
      setError(
        err.message || "An error occurred while setting the default address."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const AddressForm = () => (
    <form
      onSubmit={handleSubmitAddress}
      className="bg-white p-6 rounded-lg shadow-md space-y-4 mb-8"
    >
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        {editingAddress ? "Edit Address" : "Add New Address"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
        <InputField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          required
        />
      </div>
      <InputField
        label="Company (Optional)"
        name="company"
        value={formData.company}
        onChange={handleInputChange}
      />
      <InputField
        label="Address Line 1"
        name="address1"
        value={formData.address1}
        onChange={handleInputChange}
        required
      />
      <InputField
        label="Address Line 2 (Optional)"
        name="address2"
        value={formData.address2}
        onChange={handleInputChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="City"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
          required
        />
        <InputField
          label="Postal/Zip Code"
          name="zip"
          value={formData.zip}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          placeholder="e.g., US or United States"
          required
        />
        <InputField
          label="State/Province"
          name="province"
          value={formData.province}
          onChange={handleInputChange}
          placeholder="e.g., CA or California"
          required
        />
      </div>
      <InputField
        label="Phone (Optional)"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleInputChange}
      />
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mx-auto" />
          ) : editingAddress ? (
            "Update Address"
          ) : (
            "Save Address"
          )}
        </button>
      </div>
    </form>
  );

  const AddressDisplay = ({
    address,
    isDefault,
  }: {
    address: ShopifyAddress;
    isDefault: boolean;
  }) => (
    <div className="bg-white p-5 rounded-lg shadow-md relative">
      {isDefault && (
        <span className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          Default
        </span>
      )}
      <p className="font-semibold text-gray-700">
        {address.firstName} {address.lastName}
      </p>
      <p className="text-sm text-gray-600">{address.company}</p>
      <p className="text-sm text-gray-600">{address.address1}</p>
      {address.address2 && (
        <p className="text-sm text-gray-600">{address.address2}</p>
      )}
      <p className="text-sm text-gray-600">
        {address.city}, {address.province} {address.zip}
      </p>
      <p className="text-sm text-gray-600">{address.country}</p>
      {address.phone && (
        <p className="text-sm text-gray-600">Phone: {address.phone}</p>
      )}
      <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-2">
        <button
          onClick={() => handleEditAddress(address)}
          className="text-xs flex items-center text-blue-600 hover:text-blue-800 font-medium py-1 px-2 rounded hover:bg-blue-50 transition-colors"
        >
          <Edit3 size={14} className="mr-1" /> Edit
        </button>
        <button
          onClick={() => handleDeleteAddress(address.id)}
          disabled={isLoading}
          className="text-xs flex items-center text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} className="mr-1" /> Delete
        </button>
        {!isDefault && (
          <button
            onClick={() => handleSetDefaultAddress(address.id)}
            disabled={isLoading}
            className="text-xs flex items-center text-green-600 hover:text-green-800 font-medium py-1 px-2 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            Set as Default
          </button>
        )}
      </div>
    </div>
  );

  if (sessionStatus === "loading" || (isLoading && !showForm)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-black" />
        <p className="ml-3 text-lg font-medium text-gray-700 mt-4">
          Loading your addresses...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 text-center px-4">
        <UserCircle className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700 mb-2">
          Access Denied
        </h1>
        <p className="text-gray-500 mb-6">
          Please sign in to manage your addresses.
        </p>
        <button
          onClick={() =>
            router.push("/api/auth/signin?callbackUrl=/account/addresses")
          }
          className="px-6 py-2.5 bg-black text-white font-medium text-sm rounded-lg shadow-md hover:bg-gray-800 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <header className="mb-8 md:mb-10">
          <Link
            href="/account"
            className="flex items-center text-sm text-gray-600 hover:text-black mb-4 group"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            Back to My Account
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-800">
            Manage Addresses
          </h1>
        </header>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6"
            role="alert"
          >
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
        {successMessage && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6"
            role="alert"
          >
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p>{successMessage}</p>
            </div>
          </div>
        )}

        {showForm ? (
          <AddressForm />
        ) : (
          <button
            onClick={() => {
              setEditingAddress(null);
              setFormData({
                firstName: "",
                lastName: "",
                address1: "",
                address2: "",
                city: "",
                province: "",
                country: "",
                zip: "",
                phone: "",
                company: "",
              });
              setShowForm(true);
            }}
            className="mb-6 flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-150 ease-in-out transform hover:scale-105"
          >
            <PlusCircle size={20} /> Add New Address
          </button>
        )}

        {!isLoading && !showForm && (
          <>
            {defaultAddress && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Default Address
                </h2>
                <AddressDisplay address={defaultAddress} isDefault={true} />
              </div>
            )}

            {otherAddresses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  Other Addresses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {otherAddresses.map((addr) => (
                    <AddressDisplay
                      key={addr.id}
                      address={addr}
                      isDefault={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {!defaultAddress && otherAddresses.length === 0 && !isLoading && (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <Home className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  You haven't added any addresses yet.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  name: keyof MailingAddressInput;
  value?: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value || ""}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
    />
  </div>
);

export default ManageAddressesPage;
