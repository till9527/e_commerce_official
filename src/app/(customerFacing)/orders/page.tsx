"use client";

import { useState } from "react";
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
import { sendOTP, verifyOTP } from "@/utils/otpService"; // Assume these are helper functions for OTP handling.

export default function MyOrdersPage() {
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false); // Step control
  const [verified, setVerified] = useState<boolean>(false); // OTP verification status
  const [message, setMessage] = useState<string | null>(null); // Status messages
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent the form from causing a page refresh

    try {
      await sendOTP(email); // Function to send OTP
      setOtpSent(true); // Move to OTP input step
      setError(null);
      setMessage("OTP sent to your email. Please enter it to proceed.");
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleClickVerifyOTP = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!otp) {
      setError("OTP is required to verify.");
      return;
    }

    try {
      const isValid = await verifyOTP(email, otp); // Function to verify OTP
      if (isValid) {
        setVerified(true); // Proceed to email order history
        setMessage("OTP verified. Fetching your order history...");
        setError(null);

        // Create a FormData object with the email
        const formData = new FormData();
        formData.append("email", email);

        // Create a mock prevState (could be empty or a default value)
        const prevState = {};

        // Call emailOrderHistory with the required arguments
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

  return (
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

            {otpSent && (
              <>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  type="text"
                  required
                  name="otp"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button className="w-full mt-2" onClick={handleClickVerifyOTP}>
                  Verify OTP
                </Button>
              </>
            )}

            {error && <div className="text-destructive">{error}</div>}
            {message && <div className="text-success">{message}</div>}
          </div>
        </CardContent>
        {!otpSent && (
          <CardFooter>
            <Button className="w-full" size="lg" onClick={handleSendOTP}>
              Send OTP
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
}
