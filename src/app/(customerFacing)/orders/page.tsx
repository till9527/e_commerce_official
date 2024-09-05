"use client";

import { useState } from "react";
import Modal from "react-modal";
import { emailOrderHistory } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendOTP, verifyOTP } from "@/utils/otpService";

// Ensure to bind the modal to your app element for accessibility reasons
Modal.setAppElement("#__next");

export default function MyOrdersPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const handleSendOTP = async () => {
    try {
      await sendOTP(email);
      setOtpSent(true);
      setError(null);
      setMessage("OTP sent to your email. Please enter it to proceed.");

      // Open the modal to prompt the user for OTP
      setModalIsOpen(true);
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const isValid = await verifyOTP(email, otp);
      if (isValid) {
        setVerified(true);
        setMessage("OTP verified. Fetching your order history...");
        setError(null);

        const formData = new FormData();
        formData.append("email", email);

        const prevState = {};
        const result = await emailOrderHistory(prevState, formData);

        if (result.error) {
          setError(result.error);
        } else if (result.message) {
          setMessage(result.message);
        }
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to verify OTP. Please try again.");
    }
  };

  const handleModalSubmit = () => {
    if (otp) {
      handleVerifyOTP(otp);
      setModalIsOpen(false); // Close the modal after verification
    } else {
      setError("OTP is required to verify.");
    }
  };

  return (
    <>
      <form className="max-2-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>
              Enter your email, and we will send you an OTP to verify your identity.
              After verifying, we&apos;ll email you your order history and download links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                required
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpSent}
              />
              {error && <div className="text-destructive">{error}</div>}
              {message && <div className="text-success">{message}</div>}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleSendOTP}>
              Send OTP
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Modal for OTP input */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="OTP Verification"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Enter OTP</h2>
        <Input
          type="text"
          required
          name="otp"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button onClick={handleModalSubmit}>Verify OTP</Button>
        <Button onClick={() => setModalIsOpen(false)}>Cancel</Button>
        {error && <div className="text-destructive">{error}</div>}
        {message && <div className="text-success">{message}</div>}
      </Modal>
    </>
  );
}

