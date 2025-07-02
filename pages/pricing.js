import Link from 'next/link';

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-6">
      <h1 className="text-4xl font-bold mb-8">Choose Your Plan</h1>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <div className="bg-white shadow p-6 rounded-lg w-80">
          <h2 className="text-2xl font-bold mb-2">Basic</h2>
          <p className="mb-4">$9/month</p>
          <Link href="/checkout/basic">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Subscribe
            </button>
          </Link>
        </div>

        <div className="bg-white shadow p-6 rounded-lg w-80">
          <h2 className="text-2xl font-bold mb-2">Pro</h2>
          <p className="mb-4">$15/month</p>
          <Link href="/checkout/pro">
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Subscribe
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
