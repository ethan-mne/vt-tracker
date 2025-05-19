import React, { useState, useEffect } from "react";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Contact } from "../types/supabase";
import CreditPurchaseModal from "./CreditPurchaseModal";
import { loadStripe } from "@stripe/stripe-js";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

interface ContactFormProps {
  contact?: Contact;
  isEditing?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  isEditing = false,
}) => {
  const [first_name, setFirst_name] = useState(contact?.first_name || "");
  const [lastName, setLastName] = useState(contact?.last_name || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [addressInput, setAddressInput] = useState(contact?.address || "");
  const [postalCode, setPostalCode] = useState(contact?.postal_code || "");
  const [note, setNote] = useState(contact?.note || "");
  const [document, setDocument] = useState<File | null>(null);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [errors, setErrors] = useState<{
    first_name?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  }>({});
  const stripePromise = loadStripe(
    "pk_test_51RPLPVQBeFk3RpuyXbNl2pI1ahZu1lLYzDNQFfQrxoZDxgr0xrFNWHFyTVASlJK4wUhaZZvVhgI8CIfV83rx0B9t00c9ViLMYL"
  );
  const { user, credits, decrementCredit } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!first_name.trim()) newErrors.first_name = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    else if (
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        phone.replace(/\s/g, "")
      )
    )
      newErrors.phone = "Invalid phone";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectAddress = async (selectedAddress: string) => {
    setAddressInput(selectedAddress);
    setSuggestions([]);

    try {
      // Récupérer les détails complets de l'adresse
      const results = await getGeocode({ address: selectedAddress });
      if (results.length === 0) {
        console.warn("No geocode results found");
        return;
      }

      // Extraire latitude et longitude
      const { lat, lng } = await getLatLng(results[0]);
      setLat(lat);
      setLng(lng);

      // Trouver le code postal dans les composants de l'adresse
      const postalComponent = results[0].address_components.find((component) =>
        component.types.includes("postal_code")
      );
      setPostalCode(postalComponent?.long_name || "");

      // Mettre à jour l'adresse complète (optionnel)
      setAddressInput(selectedAddress);
    } catch (error) {
      console.error("Error during geocoding:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!isEditing && credits < 1) {
      setLoading(true);
      try {
        const stripe = await stripePromise;
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user!.id }),
        });
        const session = await response.json();
        if (session.error) throw new Error("Stripe session creation failed");
        await stripe!.redirectToCheckout({ sessionId: session.id });
      } catch (error: any) {
        console.error(error);
        toast.error("Payment error");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      let documentUrl = null;
      if (document) {
        const { data, error: uploadError } = await supabase.storage
          .from("document")
          .upload(`document/${document.name}`, document);
        if (uploadError) throw uploadError;
        documentUrl = data?.path || null;
      }

      const contactData = {
        first_name: first_name,
        last_name: lastName,
        phone,
        email,
        address: addressInput || addressInput,
        postal_code: postalCode,
        note,
        document_url: documentUrl,
        created_by: user!.id,
        latitude: lat,
        longitude: lng,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("contacts")
          .update(contactData)
          .eq("id", contact!.id);
        if (error) throw error;
        toast.success("Contact updated successfully");
      } else {
        const { error } = await supabase.from("contacts").insert(contactData);
        if (error) throw error;
        await decrementCredit();
        toast.success("Contact created successfully");
      }

      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Error saving contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="First Name"
        id="name"
        value={first_name}
        onChange={(e) => setFirst_name(e.target.value)}
        error={errors.first_name}
        required
      />
      <Input
        label="Last Name"
        id="last-name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={errors.lastName}
        required
      />
      <Input
        label="Phone"
        id="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
        required
      />
      <Input
        label="Email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        required
      />
      <div className="relative">
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Address
        </label>
        <input
          id="address"
          value={addressInput}
          onChange={(e) => setAddressInput(e.target.value)}
          placeholder="Enter address"
          autoComplete="off"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2"
          required
        />
        {loadingSuggestions && <div>Loading...</div>}
        {suggestions.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full max-h-48 overflow-auto rounded-md">
            {suggestions.map(({ place_id, description }) => (
              <li
                key={place_id}
                onClick={() => handleSelectAddress(description)}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                {description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Input
        label="Postal Code"
        id="postal-code"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
        required
      />
      <label htmlFor="note" className="block text-sm font-medium text-gray-700">
        Note
      </label>
      <textarea
        id="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        rows={3}
      />
      <label className="block text-sm font-medium text-gray-700">
        Upload Document
      </label>
      <input
        type="file"
        onChange={(e) => setDocument(e.target.files?.[0] || null)}
        className="mt-1 block w-full"
      />
      <Button type="submit" disabled={loading}>
        {loading
          ? "Submitting..."
          : isEditing
          ? "Update Contact"
          : "Create Contact"}
      </Button>
    </form>
  );
};

export default ContactForm;
