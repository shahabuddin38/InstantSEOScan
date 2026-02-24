import { Check, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Plan {
  id?: number;
  name: string;
  price: number;
  billing_cycle: number;
  features: string[];
  highlighted?: boolean;
}

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get('/api/pricing');
      setPlans(response.data.map((p: any, index: number) => ({
        ...p,
        features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
        highlighted: index === 1
      })));
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };

  const defaultPlans: Plan[] = [
    {
      name: 'Basic',
      price: 29,
      billing_cycle: 30,
      features: [
        'Up to 100 keyword searches/month',
        'Basic site audit',
        'Authority checking',
        '5 projects',
        'Email support'
      ],
      highlighted: false
    },
    {
      name: 'Pro',
      price: 99,
      billing_cycle: 30,
      features: [
        'Up to 1000 keyword searches/month',
        'Advanced site audit',
        'Authority checking with backlinks',
        '50 projects',
        'Priority email support',
        'API access',
        'Rank tracking'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 299,
      billing_cycle: 30,
      features: [
        'Unlimited keyword searches',
        'Advanced site audit',
        'Authority checking with backlinks',
        'Unlimited projects',
        '24/7 phone support',
        'API access',
        'Rank tracking',
        'Custom integrations',
        'Dedicated account manager',
        'Monthly reporting'
      ],
      highlighted: false
    }
  ];

  const displayPlans = plans.length > 0 ? plans : defaultPlans;

  const handleSelectPlan = (plan: Plan) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/register');
      return;
    }
    // In a real app, this would initiate payment/subscription
    alert(`You selected ${plan.name} plan. Subscription management will be handled in user dashboard.`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-900 text-white py-4 px-6 sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-400">InstantSEOScan</h1>
          <div className="flex gap-6 items-center">
            <Link to="/" className="hover:text-emerald-400 transition">
              Home
            </Link>
            <Link to="/about" className="hover:text-emerald-400 transition">
              About
            </Link>
            <Link to="/contact" className="hover:text-emerald-400 transition">
              Contact
            </Link>
            <Link to="/pricing" className="text-emerald-400 transition">
              Pricing
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600">
            Choose the plan that best fits your needs. Upgrade, downgrade, or cancel at any time.
            All plans include a 7-day free trial.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading pricing plans...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {displayPlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-slate-900 text-white shadow-2xl md:scale-105 md:z-10 border-2 border-emerald-500'
                    : 'bg-white text-slate-900 shadow-lg border border-slate-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-2`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                    Perfect for {plan.name === 'Basic' ? 'individuals' : plan.name === 'Pro' ? 'small teams' : 'enterprises'}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className={`text-lg ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                      /month
                    </span>
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlighted ? 'text-slate-400' : 'text-slate-600'}`}>
                    Billed monthly for {plan.billing_cycle} days
                  </p>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition ${
                    plan.highlighted
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  Get Started
                </button>

                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 flex-shrink-0 mt-1 ${
                          plan.highlighted ? 'text-emerald-400' : 'text-emerald-500'
                        }`}
                      />
                      <span className={plan.highlighted ? 'text-slate-200' : 'text-slate-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Table */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Detailed Comparison</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-4 text-left font-bold text-slate-900">Feature</th>
                  {displayPlans.map((plan) => (
                    <th key={plan.name} className="px-6 py-4 text-center font-bold text-slate-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">Keyword Research</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">Site Audit</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">Authority Checker</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">API Access</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">Priority Support</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 font-semibold">24/7 Support</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes! You can cancel your subscription anytime without penalties.'
              },
              {
                q: 'Do you offer refunds?',
                a: "We offer a 7-day money-back guarantee if you're not satisfied."
              },
              {
                q: 'Can I upgrade or downgrade mid-month?',
                a: "Yes! You can change your plan anytime. We'll prorate your billing."
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards. Contact us for other payment options.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-2 text-slate-900">{item.q}</h3>
                <p className="text-slate-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p>&copy; 2026 InstantSEOScan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
