import { useNavigate } from "react-router-dom";
import "./SynetraLanding.css"
import Lottie from 'lottie-react';
import heroAnim from '../assets/Animated Dashboards.json';
import comingSoonAnim from '../assets/loading1.json';
import { useState } from 'react';

// Use public folder paths for images
const logo = "/logo.svg";
const iconCast = "/screencast.png";
const iconNext = "/smart-house.png";
const avatarImg = "/icons8-profile-48.png";
const agiicon = "/agriculture.png";



export default function SynetraLanding() {
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle'|'sent'|'error'>('idle');

    return (
      <div className="synetra-landing">
        <header className="landing-header">
          <div className="landing-header-inner">
            <div className="logo" onClick={() => navigate('/')}>
              <img src={logo} alt="Synetra" />
            </div>

            <nav className="landing-nav" aria-label="Main Navigation">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#product">Product</a>
              <a href="#contact">Contact</a>
              <a href="#support">Support</a>
            </nav>

            <div className="landing-actions">
              <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-primary" onClick={() => setShowOrderModal(true)}>Order Your Device</button>
            </div>
          </div>
        </header>

        <main className="landing-main" id="home">
          <section className="hero">
            <div className="hero-content">
              <h1>Synetra — Smart control for Home, Farm, and Displays</h1>
              <p className="lead">Manage screen casting, home automation and agricultural automation from a single app. Plug-and-play devices, secure cloud sync, and simple scheduling.</p>
              <div className="hero-ctas">
                  <button className="btn-primary" onClick={() => setShowOrderModal(true)}>Order Your Device Now</button>
                  <a className="btn-link" href="#product">Learn More</a>
                </div>

                <form
                  className="hero-email"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setEmailStatus('error');
                      return;
                    }
                    setEmailStatus('sent');
                    console.log('Lead captured:', email);
                    setTimeout(() => setEmail(''), 800);
                  }}
                >
                  <input
                    id="lead-email"
                    type="email"
                    placeholder="Your email for updates"
                    value={email}
                    onChange={(ev) => { setEmail(ev.target.value); setEmailStatus('idle'); }}
                    className={`lead-input ${emailStatus === 'error' ? 'invalid' : ''}`}
                    required
                  />
                  <button type="submit" className="btn-ghost">Get Updates</button>
                  {emailStatus === 'sent' && <div className="email-sent">Thanks — we'll keep you posted!</div>}
                  {emailStatus === 'error' && <div className="email-error">Enter a valid email</div>}
                </form>

              </div>

              <div className="hero-media" aria-hidden>
                <Lottie animationData={heroAnim} loop style={{ width: '100%', height: '100%' }} />
              </div>
          </section>

          <section className="features" id="about">
            <h3>What Synetra does</h3>
            <div className="features-grid">
              <article className="feature-card">
                <img src={iconCast} alt="Casting" className="feature-icon" />
                <div className="feature-body">
                  <h4>Screen Casting</h4>
                  <p>Cast media from your phone or web to any connected display. Schedule playlists, manage signage, and control playback remotely.</p>
                </div>
              </article>

              <article className="feature-card">
                <img src={iconNext} alt="Automation" className="feature-icon" />
                <div className="feature-body">
                  <h4>Home Automation</h4>
                  <p>Control lights, fans, sockets and more. Create scenes, automations and monitor device health from a unified dashboard.</p>
                </div>
              </article>

              <article className="feature-card">
                <img src={agiicon} alt="Agriculture" className="feature-icon" />
                <div className="feature-body">
                  <h4>Agricultural Automation</h4>
                  <p>Automate pumps, irrigation, and sensors. Set schedules and alerts to optimize water usage and crop yield.</p>
                </div>
              </article>
            </div>
          </section>

          <section className="testimonials">
            <h3>Trusted by teams & makers</h3>
            <div className="testimonials-grid">
              <div className="testimonial">
                <img src={avatarImg} alt="User avatar" className="avatar" />
                <div className="quote">"Synetra made deploying signage across our stores effortless — scheduling and health checks work great."</div>
                <div className="by">— Priya, Retail Operations</div>
              </div>

              <div className="testimonial">
                <img src={avatarImg} alt="User avatar" className="avatar" />
                <div className="quote">"The home automations are intuitive; we saved on our energy bills after automating irrigation and lights."</div>
                <div className="by">— Marco, Farm Manager</div>
              </div>

              <div className="testimonial">
                <img src={avatarImg} alt="User avatar" className="avatar" />
                <div className="quote">"A small device with a lot of power. The scheduling UX is lovely and reliable."</div>
                <div className="by">— Aisha, Events Coordinator</div>
              </div>
            </div>
          </section>

          <section className="use-cases" id="product">
            <h3>Use cases</h3>
            <div className="use-grid">
              <div className="case">Business Displays</div>
              <div className="case">Smart Homes</div>
              <div className="case">Farms & Irrigation</div>
              <div className="case">Education & Events</div>
            </div>
          </section>

          <section className="order" id="contact">
            <h3>Ready to get started?</h3>
            <p>Order a Synetra device and connect it to your account in minutes.</p>
            <button className="btn-primary" onClick={() => setShowOrderModal(true)}>Order Now</button>
          </section>

          {showOrderModal && (
            <div className="order-modal-overlay" role="dialog" aria-modal="true" onClick={() => setShowOrderModal(false)}>
              <div className="order-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowOrderModal(false)} aria-label="Close">×</button>
                <div className="modal-body">
                  <Lottie animationData={comingSoonAnim} loop style={{ width: 220, height: 220 }} />
                  <h4>Coming soon</h4>
                  <p>We're launching ordering soon. Join the waitlist and we'll notify you when orders open.</p>
                  <div className="modal-actions">
                    <button className="btn-primary" onClick={() => { setEmailStatus('sent'); }}>Join Waitlist</button>
                    <button className="btn-outline" onClick={() => setShowOrderModal(false)}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="landing-footer">
          <div className="footer-inner">
            <div className="footer-left">© {new Date().getFullYear()} Synetra — All rights reserved.</div>
            <div className="footer-right">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#support">Support</a>
            </div>
          </div>
        </footer>
      </div>
    );
}
