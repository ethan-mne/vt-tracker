export async function createPaymentIntent(userId: string, amount: number) {
  const response = await fetch('/api/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment intent');
  }

  return response.json();
}

export async function checkPaymentStatus(paymentIntentId: string) {
  const response = await fetch(`/api/payment?paymentIntentId=${paymentIntentId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to check payment status');
  }

  return response.json();
}
