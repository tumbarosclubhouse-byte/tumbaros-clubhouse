import React, { useState, useRef, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  PawPrint,
  Plus,
  Search,
  X,
  Edit2,
  ChevronDown,
  Bath,
  Scissors,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import Select from "react-select";

const withTimeout = async <T,>(promise: Promise<T>, ms = 60000): Promise<T> => {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
};
const CACHE_KEY = "tc_cache_v1";

function loadCache(): { dogs: any[]; visits: any[] } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCache(dogs: any[], visits: any[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ dogs, visits, ts: Date.now() })
    );
  } catch {}
}
const HISTORICAL_DATA = [
  {
    month: "2024-07",
    boardingRevenue: 6550,
    daycareRevenue: 0,
    totalRevenue: 6550,
    boardingNights: 274,
    daycareVisits: 0,
    meetGreets: 0,
  },
  {
    month: "2024-08",
    boardingRevenue: 33900,
    daycareRevenue: 75,
    totalRevenue: 33975,
    boardingNights: 452,
    daycareVisits: 1,
    meetGreets: 2,
  },
  {
    month: "2024-09",
    boardingRevenue: 0,
    daycareRevenue: 0,
    totalRevenue: 3450,
    boardingNights: 0,
    daycareVisits: 0,
    meetGreets: 3,
  },
  {
    month: "2024-10",
    boardingRevenue: 0,
    daycareRevenue: 0,
    totalRevenue: 5550,
    boardingNights: 0,
    daycareVisits: 0,
    meetGreets: 0,
  },
  {
    month: "2024-11",
    boardingRevenue: 8025,
    daycareRevenue: 150,
    totalRevenue: 8175,
    boardingNights: 107,
    daycareVisits: 2,
    meetGreets: 2,
  },
  {
    month: "2024-12",
    boardingRevenue: 7800,
    daycareRevenue: 900,
    totalRevenue: 8700,
    boardingNights: 104,
    daycareVisits: 12,
    meetGreets: 2,
  },
  {
    month: "2025-01",
    boardingRevenue: 3400,
    daycareRevenue: 750,
    totalRevenue: 4150,
    boardingNights: 45,
    daycareVisits: 10,
    meetGreets: 3,
  },
  {
    month: "2025-02",
    boardingRevenue: 7350,
    daycareRevenue: 225,
    totalRevenue: 7575,
    boardingNights: 98,
    daycareVisits: 3,
    meetGreets: 4,
  },
  {
    month: "2025-03",
    boardingRevenue: 4200,
    daycareRevenue: 375,
    totalRevenue: 4575,
    boardingNights: 56,
    daycareVisits: 5,
    meetGreets: 2,
  },
  {
    month: "2025-04",
    boardingRevenue: 9900,
    daycareRevenue: 600,
    totalRevenue: 10500,
    boardingNights: 132,
    daycareVisits: 8,
    meetGreets: 8,
  },
  {
    month: "2025-05",
    boardingRevenue: 12525,
    daycareRevenue: 525,
    totalRevenue: 13050,
    boardingNights: 167,
    daycareVisits: 7,
    meetGreets: 7,
  },
  {
    month: "2025-06",
    boardingRevenue: 6300,
    daycareRevenue: 300,
    totalRevenue: 6600,
    boardingNights: 84,
    daycareVisits: 4,
    meetGreets: 3,
  },
  {
    month: "2025-07",
    boardingRevenue: 14700,
    daycareRevenue: 525,
    totalRevenue: 15225,
    boardingNights: 196,
    daycareVisits: 7,
    meetGreets: 9,
  },
  {
    month: "2025-08",
    boardingRevenue: 18150,
    daycareRevenue: 1200,
    totalRevenue: 19350,
    boardingNights: 242,
    daycareVisits: 16,
    meetGreets: 9,
  },
  {
    month: "2025-09",
    boardingRevenue: 12225,
    daycareRevenue: 2550,
    totalRevenue: 14775,
    boardingNights: 163,
    daycareVisits: 34,
    meetGreets: 9,
  },
  {
    month: "2025-10",
    boardingRevenue: 12900,
    daycareRevenue: 3375,
    totalRevenue: 16275,
    boardingNights: 172,
    daycareVisits: 45,
    meetGreets: 10,
  },
  {
    month: "2025-11",
    boardingRevenue: 14000,
    daycareRevenue: 3675,
    totalRevenue: 17675,
    boardingNights: 187,
    daycareVisits: 49,
    meetGreets: 7,
  },
  {
    month: "2025-12",
    boardingRevenue: 23775,
    daycareRevenue: 2850,
    totalRevenue: 26625,
    boardingNights: 317,
    daycareVisits: 38,
    meetGreets: 9,
  },
  {
    month: "2026-01",
    boardingRevenue: 13050,
    daycareRevenue: 4500,
    totalRevenue: 17550,
    boardingNights: 174,
    daycareVisits: 60,
    meetGreets: 8,
  },
];
function BookingRequestsPanel({ bookingRequests }: { bookingRequests: any[] }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-stone-900">Booking Requests </h2>
        <div className="text-xs text-stone-500">{bookingRequests.length}</div>
      </div>

      {bookingRequests.length === 0 ? (
        <div className="text-sm text-stone-500">No requests yet.</div>
      ) : (
        <div className="space-y-2">
          {bookingRequests.map((r) => (
            <div
              key={r.id}
              className="border border-stone-200 rounded-lg p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium text-stone-900">
                  {r.dog_name || "(no dog name)"}
                </div>

                <div className="text-xs text-stone-500 text-right whitespace-nowrap">
                  • {r.service_type || "-"}
                  {" • "}
                  {r.start_date ? String(r.start_date).slice(0, 10) : ""}
                  {r.end_date ? ` → ${String(r.end_date).slice(0, 10)}` : ""}
                </div>
              </div>
              <div className="text-xs text-stone-500 mt-1">
                {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function normalizePhone(raw: string) {
  return (raw || "").replace(/\D/g, "").slice(-10);
}
async function findDogByPhone(phoneRaw: string, dogName: string) {
  const phone10 = (phoneRaw ?? "").replace(/\D/g, "").slice(-10);
  const dogNameNorm = (dogName ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  if (!phone10 || !dogNameNorm) return null;

  // Fetch candidates by phone (supports 10-digit storage + any accidental "1"+10 storage)
  const { data, error } = await supabase
    .from("dogs")
    .select("id, data, dog_name, phone, created_at, owner_name, email")
    .or(`phone.eq.${phone10},phone.eq.1${phone10}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("findDogByPhone error:", error);
    return null;
  }

  const normalizeName = (s?: string) =>
    (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

  const match =
    (data ?? []).find((d: any) => {
      const nameFromColumn = normalizeName(d.dog_name);
      const nameFromJson = normalizeName(d?.data?.name);
      return nameFromColumn === dogNameNorm || nameFromJson === dogNameNorm;
    }) ?? null;

  return match;
  console.log("MATCH DEBUG", {
    phoneRaw,
    phone10,
    dogName,
    dogNameNorm,
    candidates: data?.length,
    match,
  });
}
export default function TumbarosManagement() {
  const [view, setView] = useState("dashboard");
  const [dogs, setDogs] = useState([]);
  const [visits, setVisits] = useState([]);
  const historicalMonthly: Record<string, number> = {
    "2024-07": 6550,
    "2024-08": 33900,
    "2024-09": 3450,
    "2024-10": 5550,
    "2024-11": 8175,
    "2024-12": 8700,
    "2025-01": 4150,
    "2025-02": 7575,
    "2025-03": 4575,
    "2025-04": 10500,
    "2025-05": 13050,
    "2025-06": 6600,
    "2025-07": 15225,
    "2025-08": 19350,
    "2025-09": 14775,
    "2025-10": 16275,
    "2025-11": 17675,
    "2025-12": 26625,
    "2026-01": 17550,
  };
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const isPublic = new URLSearchParams(window.location.search).has("public");
  // Public booking form state
  const [serviceType, setServiceType] = useState("");
  const [parentName, setParentName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("09:00");
  const [pickupTime, setPickupTime] = useState("17:00");

  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  useEffect(() => {
    if (!selectedVisit) return;
    console.log("SELECTED VISIT:", selectedVisit);
    console.log("DOGS ARRAY COUNT:", (dogs ?? []).length);
    console.log("FIRST DOG SAMPLE:", (dogs ?? [])[0]);

    const matchedDog = (dogs ?? []).find(
      (d: any) => (d?.name ?? d?.data?.name) === selectedVisit?.dog_name
    );

    console.log("MATCHED DOG:", matchedDog);
    console.log("MATCHED DOG DATA:", matchedDog?.data);
  }, [selectedVisit, dogs]);
  const fmtTime = (t: any) => {
    if (!t) return "";

    let s = String(t).trim();

    // If it's a full ISO datetime like "2026-02-04T20:18:00.000Z", extract the time part
    if (s.includes("T")) {
      s = s.split("T")[1] ?? s;
    }

    // If it has a timezone or seconds, cut down to HH:MM:SS or HH:MM
    // examples: "20:18:00.000Z" -> "20:18:00"
    s = s.replace("Z", "");
    s = s.split(".")[0] ?? s;

    // If it's still a date-only string like "2026-02-04" (no time), ignore it
    const hasColon = s.includes(":");
    const looksLikeDateOnly = s.includes("-") && !hasColon;
    if (looksLikeDateOnly) return "";

    if (!hasColon) return "";

    const [hhStr, mmStr] = s.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);

    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return "";

    // Convert to 12-hour time
    const ampm = hh >= 12 ? "PM" : "AM";
    const hour12 = ((hh + 11) % 12) + 1;

    return `${hour12}:${String(mm).padStart(2, "0")} ${ampm}`;
  };

  // Public submit -> inserts into booking_requests
  const submitPublicBooking = async () => {
    try {
      setSubmitting(true);
      setSubmitMsg("");

      if (!serviceType || !parentName || !phone || !email || !dogName) {
        setSubmitMsg(
          "Please fill out Service, Your Name, Phone, Email, and Dog Name."
        );
        return;
      }

      // helper: turns "MM/DD/YYYY" + "HH:MM" into an ISO timestamp
      const toIso = (mdy: string, hhmm: string) => {
        const [mm, dd, yyyy] = mdy.split("/");
        if (!mm || !dd || !yyyy) return null;
        // helper: turns "MM/DD/YYYY" into "YYYY-MM-DD" (date-only, no timezone)
        const toDateOnly = (mdy: string) => {
          const [mm, dd, yyyy] = mdy.split("/");
          if (!mm || !dd || !yyyy) return null;
          return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        };
      };

      // default times for now (we’ll add real dropoff/pickup inputs next)

      console.log("DEBUG VALUES:", {
        startDate,
        dropoffTime,
        endDate,
        pickupTime,
      });

      const { data: phoneMatches } = await supabase
        .from("dogs")
        .select("id, data")
        .eq("phone", cleanPhone);

      if (phoneMatches?.length) {
        const byName = phoneMatches.find(
          (d: any) =>
            String(d.data?.name ?? "").toLowerCase() ===
            String(req.dog_name ?? "").toLowerCase()
        );

        if (byName) {
          dogId = byName.id;
        }
      }

      const { error } = await supabase
        .from("booking_requests")
        .insert([
          {
            service_type: serviceType || null,
            parent_name: (parentName ?? "").trim() || null,
            phone: cleanPhone,
            email: (email ?? "").trim() || null,
            dog_name: (dogName ?? "").trim() || null,
            breed: (breed ?? "").trim() || null,
            age: (age ?? "").trim() || null,
            notes: notes || null,
            start_at: StartDate || null,
            end_at: EndDate || null,
            start_date: StartDate || null,
            end_date: EndDate || null,
            status: "pending",
            dog_id: resolvedDogId,
          },
        ])
        .select();

      console.log("INSERT RESULT:", error);

      if (error) {
        console.error("BOOKING INSERT ERROR:", error);
        setSubmitMsg("Something went wrong submitting. Please try again.");
        return;
      }

      setSubmitMsg("Request submitted! We’ll confirm soon.");
      // reset
      setServiceType("");
      setParentName("");
      setPhone("");
      setEmail("");
      setDogName("");
      setBreed("");
      setAge("");
      setNotes("");
      setStartDate("");
      setEndDate("");
    } finally {
      setSubmitting(false);
    }
  };
  const getOrCreateDogId = async (req: any) => {
    const dogName =
      req.dog_name ??
      req.dogName ??
      req.data?.name ??
      req.data?.dogName ??
      req.data?.dog_name;

    const phone =
      req.owner_phone ??
      req.ownerPhone ??
      req.phone ??
      req.owner?.phone ??
      req.data?.phone;

    const ownerName =
      req.owner_name ??
      req.ownerName ??
      req.parent_name ??
      req.parentName ??
      req.data?.owner ??
      req.data?.owner_name;

    const email =
      req.owner_email ?? req.ownerEmail ?? req.email ?? req.data?.email ?? null;

    if (!dogName || !phone) {
      console.warn("Missing dogName or phone; cannot link visit to dog_id", {
        dogName,
        phone,
      });
      return null;
    }
    // Try to find existing dog by phone + dog name (IGNORE owner_name)
    const phone10 = (phone ?? "").replace(/\D/g, "").slice(-10);
    const dogNameClean = (dogName ?? "").trim();

    const { data: existingDog, error: lookupErr } = await supabase
      .from("dogs")
      .select("id")
      .eq("phone", phone10)
      .ilike("dog_name", dogNameClean)
      .maybeSingle();

    if (lookupErr) console.error("Dog lookup error:", lookupErr);

    if (existingDog?.id) {
      return existingDog.id;
    }

    // Only create a new dog record if we DID NOT find one
    const { data: newDog, error: createErr } = await supabase
      .from("dogs")
      .insert([
        {
          dog_name: dogNameClean,
          owner_name: ownerName ?? null, // store it, but do NOT match on it
          phone: phone10,
        },
      ])
      .select("id")
      .single();

    if (createErr) {
      console.error("Dog creation error:", createErr);
      return null;
    }

    return newDog?.id ?? null;
  };

  const approveRequest = async (requestId: string) => {
    console.log("APPROVING REQUEST ID:", requestId);
    if (approvingId === requestId) return;
    setApprovingId(requestId);
    try {
      // 1️⃣ Update ONE request and return it
      const { data: req, error: updateErr } = await supabase
        .from("booking_requests")
        .update({ status: "approved" })
        .eq("id", requestId)
        .select("*")
        .single();

      if (updateErr) throw updateErr;
      if (!req) throw new Error("No request returned");
      console.log("Approved request email:", req.owner_email);

      // 2 Insert into visits (correct service + full range for boarding)
      const rawService = String(
        req.service_type ?? req.service ?? req.serviceType ?? ""
      )
        .trim()
        .toLowerCase();

      const service =
        rawService.includes("meet") || rawService.includes("greet")
          ? "meet-greet"
          : rawService.includes("board")
          ? "boarding"
          : "daycare";

      // helper: build YYYY-MM-DD list inclusive
      const buildDateRange = (s: string, e: string) => {
        const out: string[] = [];
        const d = new Date(s + "T00:00:00");
        const last = new Date(e + "T00:00:00");
        while (d < last) {
          out.push(d.toISOString().slice(0, 10));
          d.setDate(d.getDate() + 1);
        }
        return out;
      };
      // PRICING (change these if you want different rates)
      const BOARDING_NIGHT = 75;
      const DAYCARE_DAY = 74;

      // Normalize service

      const start = req.start_date ? String(req.start_date).slice(0, 10) : null;
      const end = req.end_date ? String(req.end_date).slice(0, 10) : null;
      const boardingCheckout = end; // keep calendar/end_date correct
      const checkoutForMath = end; // use end as checkout; nights = end - start
      const boardingNights =
        start && checkoutForMath
          ? Math.max(
              1,
              Math.round(
                (new Date(checkoutForMath + "T00:00:00").getTime() -
                  new Date(start + "T00:00:00").getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0;

      const unitAmount = service === "boarding" ? BOARDING_NIGHT : DAYCARE_DAY;

      // helper: build YYYY-MM-DD list inclusive
      function addDays(dateStr: string, days: number) {
        const d = new Date(dateStr + "T00:00:00");
        d.setDate(d.getDate() + days);
        return d.toISOString().slice(0, 10);
      }
      // Build rows to insert (ONE row per booking)
      const cleanPhone = (req.owner_phone || "").replace(/\D/g, "");
      let resolvedDogId = req.dog_id ?? null;

      if (!resolvedDogId && cleanPhone) {
        const { data: phoneMatches } = await supabase
          .from("dogs")
          .select("id, data")
          .eq("phone", cleanPhone);

        if (phoneMatches?.length) {
          const byName = phoneMatches.find(
            (d: any) =>
              String(d.data?.name ?? "").toLowerCase() ===
              String(req.dog_name ?? "").toLowerCase()
          );

          // If the owner has multiple dogs, match by name.
          // If we can't match by name, fall back to the first dog on that phone.
          resolvedDogId = nameMatch ? nameMatch.id : null;
        }
      }

      const ownerName =
        (req.parent_name ?? req.owner_name ?? "").trim() || null;
      const email = (req.email ?? "").trim() || null;
      const phone = cleanPhone || null;
      const notes = req.notes ?? null;
      // IMPORTANT: never match a dog using owner name alone.
      // If there's no phone AND no email, force creating a new dog profile.
      const hasPhone = !!cleanPhone;
      const hasEmail = !!email;

      if (!hasPhone && !hasEmail) {
        resolvedDogId = null; // force new dog, prevents "Anna" collisions
      }

      if (!resolvedDogId && cleanPhone) {
        const { data: phoneDogs, error: phoneDogErr } = await supabase
          .from("dogs")
          .select("id,data")
          .eq("phone", cleanPhone);

        if (phoneDogErr) {
          console.error("DOG LOOKUP ERROR:", phoneDogErr);
        } else if (phoneDogs && phoneDogs.length) {
          const reqName = (req.dog_name ?? "").trim().toLowerCase();
          const nameMatch = reqName
            ? phoneDogs.find(
                (d) => (d.data?.name ?? "").trim().toLowerCase() === reqName
              )
            : null;

          resolvedDogId = nameMatch ? nameMatch.id : null;
        }
      }
      // --- FINAL fallback: match by dog_name + owner_name (uses jsonb data) ---
      const norm = (s: any) =>
        String(s ?? "")
          .trim()
          .toLowerCase();

      if (!resolvedDogId) {
        const reqDog = norm(req.dog_name);
        const reqOwner = norm(req.parent_name ?? req.owner_name);

        const { data: dogsList, error: dogsErr } = await supabase
          .from("dogs")
          .select("id,data");

        if (dogsErr) console.error("DOGS LOAD ERROR:", dogsErr);

        const match = (dogsList ?? []).find(
          (d: any) =>
            norm(d.data?.name) === reqDog && norm(d.data?.owner) === reqOwner
        );

        resolvedDogId = match?.id ?? null;
      }

      console.log("APPROVE RESOLVED:", {
        reqId: req.id,
        dog_name: req.dog_name,
        owner: req.parent_name ?? req.owner_name,
        resolvedDogId,
      });
      // helper: turn any date-ish value into 'YYYY-MM-DD' (works for date columns)
      const toDateOnly = (v: any) => {
        if (!v) return null;
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return null;
        return d.toISOString().slice(0, 10);
      };

      const startDate = toDateOnly(
        req.start_date ?? req.date ?? req.start ?? req.day
      );
      const endDate = toDateOnly(req.end_date ?? req.end);

      console.log("DEBUG APPROVE:", {
        reqDogName: req.dog_name,
        dogNameVar: dogName,
        resolvedDogId,
      });

      console.log("USING APPROVE REQUEST PATH");

      const visitRows =
        service === "boarding" && start && end
          ? [
              {
                dog_id: resolvedDogId,
                dog_name: req.dog_name ?? dogName ?? null,
                service: service,
                service_type: service,
                start_date: startDate,
                end_date: endDate, // keep end_date as the last day shown on calendar
                dropoff_time: req.dropoff_time ?? null,
                pickup_time: req.pickup_time ?? null,
                amount: BOARDING_NIGHT * boardingNights, // total for the whole stay
                price: BOARDING_NIGHT * boardingNights,
                request_id: req.id,
              },
            ]
          : [
              {
                dog_id: resolvedDogId,
                dog_name: req.dog_name ?? dogName ?? null,
                service: service,
                service_type: service,
                start_date: startDate, // single day
                end_date: null,
                dropoff_time: req.dropoff_time ?? null,
                pickup_time: req.pickup_time ?? null,
                amount: DAYCARE_DAY,
                price: DAYCARE_DAY,
                request_id: req.id,

                owner_name: ownerName,
                phone: phone,
                email: email,
                notes: notes,
              },
            ];

      console.time("approve: insert visits");

      const { data: insertedVisits, error: insertErr } = await supabase
        .from("visits")
        .insert(visitRows)
        .select("*"); // get the actual inserted rows back

      console.timeEnd("approve: insert visits");

      if (insertErr) throw insertErr;
      // 1) Auto-create DOG profile in public.dogs if it doesn't exist yet
      try {
        // Pull owner + dog info from the approved request row (req)
        const ownerEmail =
          (req as any).owner_email ??
          (req as any).email ??
          (req as any).ownerEmail ??
          "";

        const ownerName =
          (req as any).owner_name ??
          (req as any).parent_name ??
          (req as any).ownerName ??
          "";

        const ownerPhone =
          (req as any).owner_phone ??
          (req as any).phone ??
          (req as any).ownerPhone ??
          "";

        const dogName =
          (req as any).dog_name ??
          (req as any).dogName ??
          (req as any).dog_name_first ??
          "";

        // Optional extras if your booking request contains them
        const dogAge =
          (req as any).dog_age ??
          (req as any).age ??
          (req as any).data?.age ??
          null;

        const dogBreed =
          (req as any).dog_breed ??
          (req as any).breed ??
          (req as any).data?.breed ??
          "";

        const meals = (req as any).meals ?? (req as any).data?.meals ?? "";

        const notes = (req as any).notes ?? (req as any).data?.notes ?? "";

        const photo = (req as any).photo ?? (req as any).data?.photo ?? null;

        // Only attempt if we have at least email + dog name (best unique pairing)
        if (!resolvedDogId && ownerPhone && dogName) {
          // Look for an existing dog record for this owner email + dog name (in jsonb data)
          const { data: existingDog, error: dogLookupErr } = await supabase
            .from("dogs")
            .select("id")
            .eq("email", ownerEmail)
            .contains("data", { name: dogName })
            .maybeSingle();

          if (dogLookupErr) {
            console.error("Dog lookup error:", dogLookupErr);
          }

          if (!existingDog) {
            const dogRow = {
              owner_name: ownerName || null,
              email: ownerEmail,
              phone: ownerPhone || null,
              data: {
                age: dogAge,
                name: dogName,
                breed: dogBreed || "",
                meals: meals || "",
                notes: notes || "",
                owner: ownerName || "",
                photo: photo || null,
              },
            };

            const { error: dogInsertErr } = await supabase
              .from("dogs")
              .insert(dogRow);

            if (dogInsertErr) console.error("Dog insert error:", dogInsertErr);
            else console.log("Created new dog profile:", ownerPhone, dogName);
          } else {
            console.log("Dog profile already exists:", ownerPhone, dogName);
          }
        } else {
          console.log(
            "Skipping dog auto-create (missing ownerEmail or dogName).",
            {
              ownerEmail,
              dogName,
            }
          );
        }
      } catch (e) {
        console.error("Dog auto-create failed:", e);
      }

      // 2) Send approval email via booking-status-email (the one you already tested successfully)
      try {
        console.log("Invoking booking-status-email (approve)...");

        const { data, error } = await supabase.functions.invoke(
          "booking-status-email",
          {
            body: {
              bookingID: req.id, // must match the booking_requests row id
              action: "approve", // your edge function expects approve/reject
            },
          }
        );

        if (error) console.error("booking-status-email approve error:", error);
        else console.log("booking-status-email approve success:", data);
      } catch (e) {
        console.error("booking-status-email approve invoke failed:", e);
      }

      // Update UI using what Supabase actually inserted
      if (insertedVisits?.length) {
        setVisits((prev) => [...prev, ...insertedVisits]);
      }

      setBookingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (e) {
      console.error("APPROVE_REQUEST_ERROR:", e);
      alert("Approve failed – check console.");
    } finally {
      setApprovingId(null);
    }
  };

  const rejectRequest = async (id: string) => {
    try {
      console.log("REJECTING REQUEST ID:", id);

      // 1) Mark as rejected (do NOT delete yet)
      const { data: req, error: updateErr } = await supabase
        .from("booking_requests")
        .update({ status: "rejected" })
        .eq("id", id)
        .select("*")
        .single();

      if (updateErr) throw updateErr;
      if (!req) throw new Error("No request returned after reject update");

      // 2) Trigger the booking-status-email Edge Function
      const { data, error } = await supabase.functions.invoke(
        "booking-status-email",
        {
          body: {
            bookingID: id,
            action: "reject",
          },
        }
      );

      if (error) console.error("booking-status-email reject error:", error);
      else console.log("booking-status-email reject success:", data);

      // 3) Remove from UI list
      setBookingRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error("REJECT_REQUEST ERROR:", e);
      alert("Reject failed – check console + Edge logs.");
    }
  };
  const dogsRef = useRef(dogs);
  const visitsRef = useRef(visits);

  useEffect(() => {
    dogsRef.current = dogs;
  }, [dogs]);

  useEffect(() => {
    visitsRef.current = visits;
  }, [visits]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const [form, setForm] = useState({
    owner_name: "",
    dog_name: "",
    email: "",
    phone: "",
    breed: "",
    dog_age: "",
    notes: "",
    start_date: "", // daycare date OR boarding start
    end_date: "", // boarding end
    preferred_datetime: "", // meet & greet datetime-local
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onChange = (key: keyof typeof form, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
  };

  const submitBookingRequest = async () => {
    // Block double-click + block re-submitting after success
    if (submitting || submitted) return;

    setSubmitError(null);

    console.log("=== SUBMIT CLICKED ===");
    console.log("STATE VALUES:", {
      serviceType,
      parentName,
      phone,
      email,
      dogName,
      breed,
      age,
      notes,
      startDate,
      endDate,
      dropoffTime,
      pickupTime,
    });

    // ✅ validate BEFORE setting submitting=true
    if (!serviceType || !parentName || !phone || !email || !dogName) {
      setSubmitError(
        "Please fill out service, your name, phone, email, and dog name."
      );
      return;
    }

    if (serviceType === "daycare" && !startDate) {
      setSubmitError("Please select a daycare date.");
      return;
    }

    if (serviceType === "boarding" && (!startDate || !endDate)) {
      setSubmitError("Please select boarding start and end dates.");
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        status: "pending",
        service_type: serviceType,
        owner_name: parentName,
        owner_email: email,
        owner_phone: phone,
        dog_name: dogName,
        breed,
        notes,

        // dates
        start_date: startDate || null,
        end_date:
          serviceType === "daycare" ? startDate || null : endDate || null,

        // times
        dropoff_time: dropoffTime || null,
        pickup_time: pickupTime || null,
      };

      console.log("DEBUG VALUES:", {
        startDate,
        dropoffTime,
        endDate,
        pickupTime,
      });
      console.log("PAYLOAD ABOUT TO INSERT:", payload);

      const { data, error } = await supabase
        .from("booking_requests")
        .insert(payload)
        .select()
        .single();

      console.log("INSERT RESULT:", { data, error });

      if (error) {
        console.error("BOOKING_REQUEST INSERT ERROR:", error);
        setSubmitError(error.message);
        return;
      }

      // ✅ mark submitted + message only after success
      setSubmitted(true);
      setSubmitMsg("Submitted! We'll get back to you soon!");

      // ✅ send "we got your request" email (only after successful insert)
      if (data?.id) {
        const customerEmail =
          (data as any).owner_email ??
          (payload as any).owner_email ??
          (payload as any).email ??
          (payload as any).ownerEmail;

        if (customerEmail) {
          const { error: emailErr } = await supabase.functions.invoke(
            "send-booking-email",
            {
              body: {
                bookingID: data.id,
                to: customerEmail,
                dogName: payload.dog_name,
              },
            }
          );

          if (emailErr) console.error("send-booking-email error:", emailErr);
          else console.log("send-booking-email success");
          // Admin alert email
          const { error: adminEmailErr } = await supabase.functions.invoke(
            "send-booking-email",
            {
              body: {
                bookingID: data.id,
                to: "tumbarosclubhouse@gmail.com",
                kind: "admin_new_request",
              },
            }
          );

          if (adminEmailErr)
            console.error("admin alert email error:", adminEmailErr);
          else console.log("admin alert email success");
        } else {
          console.warn(
            "No customer email found on payload/data, so no email sent."
          );
        }
      }
    } catch (e: any) {
      console.error("SUBMIT ERROR:", e);
      setSubmitError(e?.message ?? "Submit failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const didInitRef = useRef(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // ✅ Step 2: hydrate UI from local cache FIRST (so dashboard isn't blank if Supabase is down)
      const cached = loadCache();
      if (cached) {
        if (Array.isArray(cached.dogs)) setDogs(cached.dogs);
        setHydrated(true);
        setLoading(false); // show something immediately
      }

      try {
        const { data, error } = await withTimeout(
          supabase
            .from("dogs")
            .select(
              "id, dog_name:data->>name, owner_name:data->>owner_name, phone:data->>phone, email:data->>email"
            )
            .order("id", { ascending: false }),
          180000
        );
        console.log("DOGS FROM DB.", data);

        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }
        // NEW: load booking requests too
        const { data: brData, error: brError } = await withTimeout(
          supabase
            .from("booking_requests")
            .select("*")
            .in("status", ["pending", "new"])
            .order("start_date", { ascending: false }),
          60000
        );

        if (brError) {
          console.error("booking_requests load error:", brError);
        } else {
          console.log("BOOKING REQUESTS RAW:", brData);
          setBookingRequests(
            (brData || []).filter((r) => r.status === "pending")
          );
          console.log("booking_requests loaded:", (brData || []).length);
        }
        const rows = (data ?? []) as any[];

        const dogsList = rows.map((r: any) => {
          const j = r.data ?? {};

          return {
            ...r,
            ...j,

            id: String(r.id),
            created_at: r.created_at,

            // Normalize fields so edit form works
            name: r.dog_name ?? j.name ?? "",
            owner: r.owner_name ?? j.owner ?? "",
            phone: r.phone ?? j.phone ?? "",
            email: r.email ?? j.email ?? "",
          };
        });
        // Load dogs
        const { data: dogRows, error: dogErr } = await supabase
          .from("dogs")
          .select(
            "id, created_at, data, dog_name:data->>name, owner_name:data->>owner_name"
          ) // don't pull every column
          .order("created_at", { ascending: false });

        if (dogErr) {
          console.error("DOGS LOAD ERROR:", dogErr);
        } else {
          console.log("Loaded dogs:", dogRows);
          const liteDogs = (dogRows || []).map((d: any) => ({
            ...d,
            // keep the full data (INCLUDING photo) so profiles can display it
            data: d?.data ?? null,
          }));

          setDogs(liteDogs);

          const cacheDogs = liteDogs.map((d: any) => ({
            ...d,
            data: d?.data ? { ...d.data, photo: null } : d.data,
          }));

          saveCache({ dogs: cacheDogs, visits: visitsRef.current });
        }

        // If visits are stored elsewhere, leave this empty for now:

        // Load booking requests
        // Load visits from public.visits
        // Get only the next 30 days of visits (fast + practical)
        const { data: visitRows, error: visitErr } = await supabase
          .from("visits")
          .select(
            "id, dog_id, dog_name, start_date, end_date, created_at, service_type, amount, dropoff_time, pickup_time, price"
          )
          .order("start_date", { ascending: true });

        if (visitErr) {
          console.error("VISITS LOAD ERROR:", visitErr);
        } else {
          //  console.log("Loaded visits from public.visits:", visitRows);
          //  console.log("ONE VISIT SAMPLE:", visitRows?.[0]);
          const normalizedVisits = visitRows || [];

          setVisits(normalizedVisits);
          saveCache({ dogs: dogsRef.current, visits: normalizedVisits });
          console.log("SETTING VISITS:", normalizedVisits.length);
        }
        const { data: reqRows, error: reqErr } = await supabase
          .from("booking_requests")
          .select(
            "id, created_at, status, dog_name, service_type, start_date, end_date"
          )
          .in("status", ["pending", "new"])
          .order("start_date", { ascending: false });

        if (reqErr) {
          console.error("BOOKING_REQUESTS_LOAD_ERROR:", reqErr);
          console.log("reqErr is:", reqErr);
        } else {
          const normalizedReqRows = (reqRows || []).map((r: any) => ({
            ...r,
            service_type: r.service_type ?? r.service ?? r.serviceType ?? "",
            start_date:
              r.start_date ?? r.startDate ?? r.checkIn ?? r.date ?? null,
            end_date: r.end_date ?? r.endDate ?? r.checkOut ?? null,
          }));

          setBookingRequests(normalizedReqRows);
          console.log("BOOKING REQUESTS NORMALIZED:", normalizedReqRows);
        }

        setHydrated(true);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    // Skip the very first run so you don't overwrite Supabase on initial load
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }

    const save = async () => {
      try {
        return; //TEMP: disable app_state saving (prevents breaking loads)
        // build payload without photo so we don't overwrite stored photos in Supabase
        // Save ALL state (dogs + visits) into app_state.
        // Strip photo so we don’t overwrite stored photos.
        const dogsForState = dogs.map((d: any) => {
          const { photo, ...rest } = d;
          return rest;
        });

        const statePayload = {
          id: 1,
          state: {
            dogs: dogsForState,
            visits: visits,
            // IMPORTANT: always include visits so they don’t get wiped
          },
        };

        //  TEMP: disable app_state saving (causing timeouts)

        if (false) {
          const { error } = await supabase
            .from("app_state")
            .upsert(statePayload, { onConflict: "id" });

          if (error) console.error("APP_STATE SAVE ERROR:", error);
        }
      } catch (err) {
        console.error("SAVE CRASH:", err);
      }
    };

    void save();
  }, [dogs, visits, hydrated]);
  if (isPublic) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="max-w-xl mx-auto bg-white rounded-lg p-6 shadow">
          <h1 className="text-2xl font-semibold mb-2">Request a Booking</h1>
          <p className="text-sm text-stone-500 mb-6">
            Submit your request and we’ll confirm availability.
          </p>

          <div className="space-y-4">
            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Service</label>
              <select
                className="w-full border rounded-md p-2"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Select one…</option>
                <option value="daycare">Daycare</option>
                <option value="boarding">Boarding</option>
                <option value="meet_greet">Meet & Greet</option>
              </select>
            </div>

            {/* Parent Info */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                className="w-full border rounded-md p-2"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  className="w-full border rounded-md p-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(###) ###-####"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  className="w-full border rounded-md p-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </div>
            </div>

            {/* Dog Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Dog Name
                </label>
                <input
                  className="w-full border rounded-md p-2"
                  value={dogName}
                  onChange={(e) => setDogName(e.target.value)}
                  placeholder="Dog’s name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Breed</label>
                <input
                  className="w-full border rounded-md p-2"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Breed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  className="w-full border rounded-md p-2"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  className="w-full border rounded-md p-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything important?"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded-md p-2"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full border rounded-md p-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {/* Drop-off Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Drop-off Time
              </label>
              <input
                type="time"
                className="w-full border rounded-md p-2"
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
              />
            </div>

            {/* Pick-up Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pick-up Time
              </label>
              <input
                type="time"
                className="w-full border rounded-md p-2"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </div>
            {/* Submit */}
            <button
              className="w-full bg-emerald-700 text-white rounded-md p-2 font-medium disabled:opacity-50"
              onClick={submitBookingRequest}
              disabled={submitting || submitted}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>

            {submitMsg && (
              <p className="text-sm text-stone-600 mt-2">{submitMsg}</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-800 text-stone-50 border-b border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-emerald-800" />
            </div>
            <div>
              <h1 className="text-2xl font-light tracking-wide">
                Tumbaros Clubhouse
              </h1>
              <p className="text-stone-400 text-sm">Business Console</p>
            </div>
          </div>
        </div>
      </header>
      {/* Booking Requests Panel */}
      <div className="bg-white rounded-lg p-4 shadow mt-6">
        <h2 className="text-lg font-semibold mb-3">Booking Requests </h2>

        {bookingRequests.length === 0 && (
          <p className="text-sm text-stone-500">No booking requests yet.</p>
        )}

        {bookingRequests.map((req) => (
          <div
            key={req.id}
            className="border border-stone-200 rounded-lg p-3 text-sm flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-stone-900">
                {req.dog_name || "(no dog name)"}
              </div>

              <div className="text-xs text-stone-500 mt-1">
                <span className="font-medium">{req.service_type || "-"}</span>
                {" • "}
                {req.start_date ?? "?"}
                {req.end_date ? ` → ${req.end_date}` : ""}
              </div>

              <div className="text-xs text-stone-500 mt-1">
                Status: {req.status}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className={`bg-emerald-600 text-white px-3 py-1 rounded ${
                  approvingId === req.id ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => approveRequest(req.id)}
                disabled={approvingId === req.id || req.status === "approved"}
              >
                {approvingId === req.id
                  ? "Approving..."
                  : req.status === "approved"
                  ? "Approved"
                  : "Approve"}
              </button>

              <button
                className="bg-rose-600 text-white px-3 py-1 rounded"
                onClick={() => rejectRequest(req.id)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-56 space-y-1 flex-shrink-0">
          {[
            { i: TrendingUp, l: "Dashboard", v: "dashboard" },
            { i: PawPrint, l: "Members", v: "dogs" },
            { i: Calendar, l: "Visits", v: "visits" },
            { i: DollarSign, l: "Analytics", v: "analytics" },
          ].map((n) => (
            <button
              key={n.v}
              onClick={() => setView(n.v)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg font-light text-sm transition-all ${
                view === n.v
                  ? "bg-emerald-800 text-white"
                  : "text-stone-600 hover:bg-stone-200"
              }`}
            >
              <n.i className="w-4 h-4 flex-shrink-0" />
              <span>{n.l}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 min-w-0">
          {view === "dashboard" && <Dashboard dogs={dogs} visits={visits} />}
          {view === "dogs" && (
            <Dogs dogs={dogs} setDogs={setDogs} visits={visits} />
          )}
          {view === "visits" && (
            <Visits
              visits={visits}
              setVisits={setVisits}
              dogs={dogs}
              selectedVisit={selectedVisit}
              setSelectedVisit={setSelectedVisit}
            />
          )}
          {view === "analytics" && (
            <Analytics visits={visits} historicalMonthly={historicalMonthly} />
          )}
        </main>
      </div>
    </div>
  );
}

function Dashboard({ dogs, visits }) {
  console.log("DASHBOARD VISITS LENGTH:", visits?.length);
  // --- Dashboard: correct "today" + "this month" counts & revenue ---
  // Use local YYYY-MM-DD (avoids UTC date shifting)
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const localYMD = (d = new Date()) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const today = localYMD();
  const monthStart = `${new Date().getFullYear()}-${pad2(
    new Date().getMonth() + 1
  )}-01`;
  const nextMonthStart = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth();
    const nm = m === 11 ? 0 : m + 1;
    const ny = m === 11 ? y + 1 : y;
    return `${ny}-${pad2(nm + 1)}-01`;
  })();

  const toMidnight = (ymd: string) => new Date(ymd + "T00:00:00");
  const dayDiff = (startYmd: string, endYmd: string) =>
    Math.max(
      0,
      Math.round(
        (toMidnight(endYmd).getTime() - toMidnight(startYmd).getTime()) /
          86400000
      )
    );

  const isBoarding = (v: any) =>
    String(v?.service_type ?? v?.serviceType ?? v?.service ?? v?.type ?? "")
      .toLowerCase()
      .includes("board");
  const isDaycare = (v: any) =>
    (v.service_type ?? v.service ?? "").toLowerCase() === "daycare";

  // boarding is active on day if start_date <= day < end_date
  const isActiveOnDay = (v: any, ymd: string) => {
    const sRaw = v.start_date ?? v.checkIn ?? v.date;
    const eRaw = v.end_date ?? v.checkOut;
    if (!sRaw) return false;

    const s = String(sRaw).slice(0, 10);

    if (isBoarding(v)) {
      if (!eRaw) return false;
      const e = String(eRaw).slice(0, 10);
      return ymd >= s && ymd < e;
    }

    // daycare single day
    return ymd === s;
  };

  // Daily revenue: daycare = full amount; boarding = (total amount / nights)
  const perDayRevenue = (v: any) => {
    const amt = Number(v.amount ?? v.price ?? 0);
    if (!amt) return 0;

    if (isBoarding(v)) {
      const s = String(v.start_date).slice(0, 10);
      const e = String(v.end_date).slice(0, 10);
      const nights = dayDiff(s, e);
      return nights > 0 ? amt / nights : 0;
    }

    return amt;
  };

  const todayV = visits.filter((v: any) => isActiveOnDay(v, today));
  const monthV = visits.filter(
    (v: any) =>
      isActiveOnDay(v, monthStart) ||
      (String(v.start_date ?? v.checkIn ?? v.date ?? "").slice(0, 10) >=
        monthStart &&
        String(v.start_date ?? v.checkIn ?? v.date ?? "").slice(0, 10) <
          nextMonthStart)
  );
  const todayRev = todayV.reduce(
    (sum: number, v: any) => sum + perDayRevenue(v),
    0
  );

  // Month revenue: sum the overlap days * per-day revenue (boarding) + daycare days in month
  const toYMD = (v: any) =>
    v.start_date ?? v.date ?? v.check_in ?? v.checkIn ?? v.visit_date ?? "";

  console.log("MONTH START:", monthStart);
  console.log("NEXT MONTH START:", nextMonthStart);
  console.log("TOTAL VISITS PASSED IN:", visits.length);
  console.log("ALL VISITS PASSED TO DASHBOARD:", visits);

  // --- helpers (put these right above monthRev, inside Dashboard) ---
  const ymdToUTC = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  };

  const daysCeil = (a: Date, b: Date) =>
    Math.ceil((b.getTime() - a.getTime()) / 86400000);

  const toStartYMD = (v: any) =>
    String(
      v?.start_date ??
        v?.startDate ??
        v?.check_in ??
        v?.checkIn ??
        v?.date ??
        v?.visit_date ??
        ""
    ).slice(0, 10);

  const toEndYMD = (v: any) =>
    String(
      v?.end_date ?? v?.endDate ?? v?.check_out ?? v?.checkOut ?? ""
    ).slice(0, 10);

  const toAmt = (v: any) =>
    Number(
      String(v?.amount ?? v?.total ?? v?.price ?? v?.cost ?? 0).replace(
        /[^0-9.-]/g,
        ""
      )
    ) || 0;

  const monthStartUTC = ymdToUTC(monthStart);
  const nextMonthStartUTC = ymdToUTC(nextMonthStart);

  // --- This Month revenue (daycare + prorated boarding nights in month) ---
  const monthRev = (visits || []).reduce((sum: number, v: any) => {
    const amt = toAmt(v);
    if (!amt) return sum;

    const sYMD = toStartYMD(v);
    if (!sYMD) return sum;

    const eYMD = toEndYMD(v);

    // DAYCARE / single-day
    if (!eYMD || eYMD <= sYMD) {
      return sYMD >= monthStart && sYMD < nextMonthStart ? sum + amt : sum;
    }

    // BOARDING: prorate by nights, take overlap nights in this month
    const s = ymdToUTC(sYMD);
    const e = ymdToUTC(eYMD);

    const totalNights = Math.max(1, daysCeil(s, e));
    const perNight = amt / totalNights;

    const overlapStart = new Date(
      Math.max(s.getTime(), monthStartUTC.getTime())
    );
    const overlapEnd = new Date(
      Math.min(e.getTime(), nextMonthStartUTC.getTime())
    );

    const overlapNights = Math.max(0, daysCeil(overlapStart, overlapEnd));
    return sum + perNight * overlapNights;
  }, 0);

  const todaysBoardingCount = todayV.filter(
    (v: any) => (v.service_type ?? v.service) === "boarding"
  ).length;
  // Use this for your "0 boarding" label on the dashboard
  const allRev =
    HISTORICAL_DATA.reduce((s, m) => s + m.totalRevenue, 0) +
    visits.reduce((s, v) => s + (v.amount || 0), 0);
  const monthsWithData = new Set(
    visits
      .filter((v) => v.date)
      .map((v) => {
        const d = new Date(v.date);
        return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 7);
      })
      .filter(Boolean)
  );

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;

  const monthlyTotals: Record<string, number> = {};

  (visits ?? []).forEach((v: any) => {
    const month = (v.checkIn ?? v.date ?? v.created_at ?? "").slice(0, 7);
    if (!month) return;
    if (month > currentMonthKey) return; // ignore future months
    monthlyTotals[month] =
      (monthlyTotals[month] || 0) + Number(v.price ?? v.amount ?? 0);
  });

  const validMonths = Object.keys(monthlyTotals).filter(
    (m) => (monthlyTotals[m] || 0) > 0
  );

  const avg =
    validMonths.length > 0
      ? validMonths.reduce((sum, m) => sum + monthlyTotals[m], 0) /
        validMonths.length
      : 0;

  const growth = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Today" value={`$${todayRev.toFixed(0)}`} />
        <Metric label="This Month" value={`$${monthRev.toFixed(0)}`} />
        <Metric label="All Time" value={`$${(allRev / 1000).toFixed(1)}k`} />
        <Metric
          label="Avg Monthly"
          value={`$${avg.toFixed(0)}`}
          trend={growth > 0 ? "up" : "down"}
          trendVal={`${Math.abs(growth).toFixed(1)}%`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            l: "Today's Visits",
            v: todayV.length,
            s: `${todaysBoardingCount} boarding`,
          },
          { l: "Active Members", v: dogs.length, s: "club members" },
          { l: "Month Visits", v: monthV.length, s: "total" },
        ].map((d) => (
          <div
            key={d.l}
            className="bg-emerald-50 border border-emerald-200 rounded-lg p-5"
          >
            <p className="text-xs text-emerald-700 mb-1">{d.l}</p>
            <p className="text-3xl font-light text-emerald-900">{d.v}</p>
            <p className="text-xs text-emerald-600 mt-1">{d.s}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h3 className="font-light text-lg mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {visits
            .slice(-8)
            .reverse()
            .map((v, i) => {
              const dogName =
                v.dog_name ||
                v.dogName ||
                dogs.find(
                  (d: any) => String(d.id) === String(v.dog_id ?? v.dogId)
                )?.dog_name ||
                dogs.find(
                  (d: any) => String(d.id) === String(v.dog_id ?? v.dogId)
                )?.name ||
                dogs.find(
                  (d: any) => String(d.id) === String(v.dog_id ?? v.dogId)
                )?.data?.dog_name ||
                dogs.find(
                  (d: any) => String(d.id) === String(v.dog_id ?? v.dogId)
                )?.data?.name ||
                (v.dog_id ?? v.dogId
                  ? `Unknown (dog_id: ${v.dog_id ?? v.dogId})`
                  : "Unknown");
              return (
                <div
                  key={i}
                  className="flex justify-between py-3 border-b border-stone-100 last:border-0"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-medium flex-shrink-0">
                      {dogName?.[0] || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{dogName}</p>
                      <p className="text-xs text-stone-500">
                        {v.serviceType} • {v.checkIn || v.date}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-emerald-700 flex-shrink-0">
                    ${v.price?.toFixed(0)}
                  </span>
                </div>
              );
            })}
          {visits.length === 0 && (
            <p className="text-center text-stone-400 py-8 text-sm">
              No visits yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, trend, trendVal }) {
  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5">
      <p className="text-xs text-stone-500 mb-1 truncate">{label}</p>
      <p className="text-2xl font-light text-stone-900 mb-1 truncate">
        {value}
      </p>
      {trend && (
        <div
          className={`flex items-center space-x-1 text-xs ${
            trend === "up" ? "text-emerald-600" : "text-stone-400"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
          ) : (
            <ArrowDownRight className="w-3 h-3 flex-shrink-0" />
          )}
          <span>{trendVal}</span>
        </div>
      )}
    </div>
  );
}

function Dogs({ dogs, setDogs, visits }) {
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);
  const [add, setAdd] = useState(false);

  const q = (search ?? "").toLowerCase();

  const filtered = (dogs ?? []).filter((d: any) => {
    const name = (d?.data?.name ?? d?.name ?? "").toLowerCase();
    const owner = (d?.data?.owner ?? d?.owner ?? "").toLowerCase();
    const term = (search ?? "").toLowerCase();

    return name.includes(term) || owner.includes(term);
  });

  if (sel)
    return (
      <DogDetail
        dog={sel}
        visits={visits}
        onBack={() => setSel(null)}
        onUpdate={(id, patch) => {
          setDogs((prev) => {
            const next = prev.map((d) =>
              d.id === id ? { ...d, ...patch } : d
            );
            const updated = next.find((d) => d.id === id);

            if (updated) {
              const { id: _id, ...payload } = updated; // store everything except id inside data
              (async () => {
                const { error } = await supabase
                  .from("dogs")
                  .update({
                    data: payload,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", id);

                if (error) console.error("DOG SAVE ERROR:", error);
              })();
            }

            return next;
          });

          setSel(null);
        }}
        onDelete={async (id) => {
          if (confirm("Delete?")) {
            await supabase.from("dogs").delete().eq("id", id);
            setDogs((prev) => prev.filter((d) => d.id !== id));
            setSel(null);
          }
        }}
      />
    );
  if (add)
    return (
      <DogForm
        onSave={async (data) => {
          const owner_name =
            (data.owner_name ?? data.owner ?? "").trim() || null;
          const email = (data.email ?? "").trim() || null;
          const phone =
            (data.phone ?? "")
              .replace(/\D/g, "") // removes all non-digits
              .trim() || null;
          const cleaned = { ...data, owner_name, email, phone };

          const { data: inserted, error } = await supabase
            .from("dogs")
            .insert({
              dog_name: (cleaned.dog_name ?? cleaned.name ?? "").trim() || null,
              owner_name,
              email,
              phone,
              data: cleaned,
            })
            .select("*")
            .single();

          if (error) return;

          setDogs((prev) => [
            {
              ...((inserted.data ?? {}) as any),
              id: String(inserted.id),
              created_at: inserted.created_at,
            },
            ...prev,
          ]);
          setAdd(false);
        }}
        onCancel={() => setAdd(false)}
      />
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-light">Club Members</h2>
        <button
          onClick={() => setAdd(true)}
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-sm flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:border-emerald-600"
      />

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((dog) => (
          <div
            key={String(dog.id)}
            onClick={() => setSel(dog)}
            className="bg-white border border-stone-200 rounded-lg p-4 cursor-pointer hover:border-emerald-600 transition-all"
          >
            {dog.photo ?? dog.data?.photo ? (
              <img
                src={dog.photo ?? dog.data?.photo}
                className="w-full h-32 object-cover rounded-lg mb-3"
                alt={dog.name}
              />
            ) : (
              <div className="w-full h-32 bg-stone-100 rounded-lg mb-3 flex items-center justify-center">
                <PawPrint className="w-8 h-8 text-stone-300" />
              </div>
            )}
            <h3 className="font-medium text-stone-800 mb-1 truncate">
              {dog.data?.name ?? dog.name ?? "Unnamed"}
            </h3>
            <p className="text-xs text-stone-500 mb-2 truncate">
              {dog.data?.owner ?? dog.owner ?? "No owner"}
            </p>
            <p className="text-xs text-emerald-700">
              {(() => {
                const d = dog?.data ? { ...dog, ...(dog.data ?? {}) } : dog;
                const past = Number(d.lifetimeVisits || 0);
                const count = visits.filter(
                  (v) => String(v.dogId ?? v.dog_id) === String(d.id)
                ).length;
                return past + count;
              })()}{" "}
              visits{" "}
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <PawPrint className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No members found</p>
        </div>
      )}
    </div>
  );
}

function DogForm({ dog, onSave, onCancel }) {
  const [data, setData] = useState(
    dog?.data ||
      dog || {
        name: "",
        owner: "",
        email: "",
        phone: "",
        breed: "",
        age: "",
        photo: "",
        meals: "",
        medications: "",
        temperament: "",
        notes: "",
        lifetimeVisits: 0,
        lifetimeRevenue: 0,
      }
  );

  let lastPreviewUrl: string | null = null;

  async function compressImage(file: File, maxSize = 1600, quality = 0.75) {
    const img = document.createElement("img");
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
    });

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(img, 0, 0, w, h);

    URL.revokeObjectURL(objectUrl);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", quality)
    );

    if (!blob) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
      type: "image/jpeg",
    });
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress first so iPhone doesn't crash
    const compressed = await compressImage(file, 1200, 0.7);

    // Convert compressed image to base64 so it persists (blob: urls break later)
    const reader = new FileReader();
    reader.onloadend = () => {
      setData((prev: any) => ({
        ...prev,
        photo: reader.result as string,
      }));
    };
    reader.readAsDataURL(compressed);
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-light">
          {dog ? "Edit Member" : "New Member"}
        </h2>
        <button
          onClick={onCancel}
          className="text-stone-400 hover:text-stone-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-stone-600 mb-1">Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="text-sm"
          />
          {data.photo && (
            <img
              src={data.photo}
              className="mt-2 w-24 h-24 object-cover rounded-lg"
              alt="Preview"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { k: "name", l: "Name *", req: true },
            { k: "owner", l: "Owner" },
            { k: "phone", l: "Phone" },
            { k: "email", l: "Email" },
            { k: "breed", l: "Breed" },
            { k: "age", l: "Age" },
            { k: "lifetimeVisits", l: "Past Visits (before app)" },
            { k: "lifetimeRevenue", l: "Past Revenue $ (before app)" },
          ].map((f) => (
            <div key={f.k}>
              <label className="block text-xs text-stone-600 mb-1">{f.l}</label>
              <input
                type={
                  ["lifetimeVisits", "lifetimeRevenue"].includes(f.k)
                    ? "number"
                    : "text"
                }
                required={f.req}
                value={data[f.k]}
                onChange={(e) => setData({ ...data, [f.k]: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          ))}
        </div>

        {["meals", "medications", "temperament", "notes"].map((k) => (
          <div key={k}>
            <label className="block text-xs text-stone-600 mb-1 capitalize">
              {k}
            </label>
            <textarea
              value={data[k]}
              onChange={(e) => setData({ ...data, [k]: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>
        ))}

        <div className="flex space-x-3 pt-4">
          <button
            onClick={() => {
              onSave(data);
            }}
            className="flex-1 py-2.5 bg-emerald-800 text-white rounded-lg text-sm"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-stone-200 text-stone-700 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DogDetail({ dog, visits, onBack, onUpdate, onDelete }) {
  const d = dog?.data ? { ...dog, ...(dog.data ?? {}) } : dog;
  const [edit, setEdit] = useState(false);
  const dogVisits = visits.filter(
    (v: any) => String(v.dog_id) === String(d.id)
  );

  const pastVisits = Number(d.lifetimeVisits || 0);
  const pastRevenue = Number(d.lifetimeRevenue || 0);

  const futureVisitsCount = dogVisits.length;
  const futureRevenue = dogVisits.reduce((s, v) => s + (v.price || 0), 0);

  const totalVisits = pastVisits + futureVisitsCount;
  const totalRev = pastRevenue + futureRevenue;

  if (edit) {
    return (
      <DogForm
        dog={dog}
        onSave={async (formData) => {
          const payload: any = { ...formData };
          delete payload.id;
          delete payload.created_at;

          const { error } = await supabase
            .from("dogs")
            .update({ data: payload })
            .eq("id", dog.id);

          if (error) {
            console.error("DOG UPDATE ERROR:", error);
            return;
          }

          onUpdate(dog.id, { ...dog, ...payload });
          setEdit(false);
        }}
        onCancel={() => setEdit(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="text-stone-600 hover:text-stone-900 text-sm flex items-center space-x-1"
        >
          <ChevronDown className="w-4 h-4 rotate-90" />
          <span>Back</span>
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => setEdit(true)}
            className="px-3 py-1.5 bg-emerald-800 text-white rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(dog.id)}
            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-emerald-800 to-emerald-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            {d.photo ? (
              <img
                src={d.photo}
                className="w-24 h-24 rounded-lg border-4 border-white object-cover"
                alt={d.data?.name}
              />
            ) : (
              <div className="w-24 h-24 bg-stone-200 rounded-lg border-4 border-white flex items-center justify-center">
                <PawPrint className="w-12 h-12 text-stone-400" />
              </div>
            )}
            <div className="ml-4 mb-2 min-w-0 flex-1">
              <h2 className="text-2xl font-light truncate">{d.data?.name}</h2>
              <p className="text-sm text-stone-500 truncate">
                {d.owner || "No owner"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { l: "Visits", v: totalVisits },
              { l: "Revenue", v: `$${(totalRev / 1000).toFixed(1)}k` },
              { l: "Age", v: d.age || "N/A" },
            ].map((s) => (
              <div key={s.l} className="text-center p-3 bg-stone-50 rounded-lg">
                <p className="text-xl font-light truncate">{s.v}</p>
                <p className="text-xs text-stone-500">{s.l}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {Object.entries({
              breed: d.breed,
              meals: d.meals,
              medications: d.medications,
              temperament: d.temperament,
              notes: d.notes,
            }).map(
              ([k, v]) =>
                v && (
                  <div key={k} className="border-b border-stone-100 pb-2">
                    <p className="text-xs text-stone-500 mb-1 capitalize">
                      {k}
                    </p>
                    <p className="text-sm text-stone-700">{v}</p>
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h3 className="font-light mb-4">Visit History</h3>
        <div className="space-y-2">
          {dogVisits
            .slice()
            .reverse()
            .map((v, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b border-stone-100 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize truncate">
                    {v.serviceType}
                  </p>
                  <p className="text-xs text-stone-500">
                    {v.checkIn ? `${v.checkIn} to ${v.checkOut}` : v.date}
                  </p>
                </div>
                <span className="text-sm font-medium text-emerald-700 flex-shrink-0 ml-4">
                  ${v.price?.toFixed(0)}
                </span>
              </div>
            ))}
          {dogVisits.length === 0 && (
            <p className="text-center text-stone-400 py-4 text-sm">
              No visits yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Visits({ visits, setVisits, dogs, selectedVisit, setSelectedVisit }) {
  const [add, setAdd] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [filter, setFilter] = useState("all");
  const [isEditingVisit, setIsEditingVisit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editVisitDraft, setEditVisitDraft] = useState<any>(null);

  const fmtTime = (t: any) => {
    if (!t) return "";

    const s = String(t);

    // If it's ISO (has T in it)
    if (s.includes("T")) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    }

    // If it's plain time like "14:23" or "09:00:00"
    const parts = s.split(":");
    if (parts.length >= 2) {
      let hour = parseInt(parts[0], 10);
      const minute = parts[1];

      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      if (hour === 0) hour = 12;

      return `${hour}:${minute} ${ampm}`;
    }

    return "";
  };
  const dogForSelected = selectedVisit
    ? (() => {
        const d = dogs.find(
          (dog: any) => (dog.name ?? dog.data?.name) === selectedVisit.dog_name
        );

        if (!d) return null;

        return {
          ...d,
          ownerName:
            d.data?.owner_name ??
            d.data?.ownerName ??
            d.data?.parent_name ??
            d.data?.parentName ??
            null,
          phone:
            d.data?.phoneNumber ??
            d.data?.owner_phone ??
            d.data?.ownerPhone ??
            d.data?.member_phone ??
            d.data?.memberPhone ??
            d.data?.parent_phone ??
            d.data?.parentPhone ??
            d.data?.mobile ??
            d.data?.mobile_number ??
            d.data?.mobileNumber ??
            d.data?.owner?.phone ??
            d.data?.member?.phone ??
            null,
        };
      })()
    : null;
  useEffect(() => {
    console.log("VISITS selectedVisit CHANGED ->", selectedVisit);
  }, [selectedVisit]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const getVisitTypeForDay = (visit: any, day: string) => {
    const isCheckIn = visit.checkIn === day;
    const isCheckOut = visit.checkOut === day;

    // try lots of possible field names so it works with your current data
    const startT = fmtTime(
      visit.start_time ??
        visit.startTime ??
        visit.dropoff_time ??
        visit.dropoffTime ??
        visit.start_at ??
        visit.startAt ??
        visit.dropoffAt
    );

    const endT = fmtTime(
      visit.end_time ??
        visit.endTime ??
        visit.pickup_time ??
        visit.pickupTime ??
        visit.end_at ??
        visit.endAt ??
        visit.pickupAt
    );

    const service = String(
      visit.serviceType ?? visit.service ?? ""
    ).toLowerCase();

    // DAYCARE: show start-end
    if (service === "daycare") {
      const timeTxt =
        startT && endT ? `${startT}-${endT}` : startT || endT || "";
      return {
        label: `D${timeTxt ? ` ${timeTxt}` : ""}`,
        color: "bg-blue-100 text-blue-700",
      };
    }

    // MEET & GREET: show start only
    if (
      service === "meet_and_greet" ||
      service === "meet and greet" ||
      service === "meet&greet"
    ) {
      return {
        label: `M${startT ? ` ${startT}` : ""}`,
        color: "bg-purple-100 text-purple-700",
      };
    }

    // BOARDING: green = check-in day (show start), red = check-out day (show end)
    if (isCheckIn) {
      return {
        label: `B${startT ? ` ${startT}` : ""}`,
        color: "bg-green-100 text-green-700",
      };
    }

    if (isCheckOut) {
      return {
        label: `B${endT ? ` ${endT}` : ""}`,
        color: "bg-red-100 text-red-700",
      };
    }

    // middle boarding days (no time needed)
    return {
      label: "B",
      color: "bg-gray-100 text-gray-700",
    };
  };
  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };
  const norm = (s: any) =>
    String(s ?? "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");

  const filtered =
    filter === "all"
      ? visits
      : visits.filter((v: any) => {
          const rowType = norm(v.service_type ?? v.serviceType ?? v.service);
          const wantType = norm(filter);
          return rowType === wantType;
        });

  if (add)
    return (
      <VisitForm
        dogs={dogs}
        initialData={isEditingVisit ? editVisitDraft : null}
        mode={isEditingVisit ? "edit" : "create"}
        onSave={async (data) => {
          const dog = dogs.find(
            (d: any) => Number(d.id) === Number(data.dogId)
          );
          const payload = {
            dog_id: dog?.id ?? null,
            dog_name: dog?.dog_name ?? null,
            owner_name: dog?.owner_name ?? dog?.owner ?? null,
            email: dog?.email ?? null,
            phone: dog?.phone ?? null,
            service: data.serviceType === "daycare" ? "daycare" : "boarding",
            service_type: data.serviceType,
            start_date: data.checkIn
              ? String(data.checkIn).slice(0, 10)
              : data.date
              ? String(data.date).slice(0, 10)
              : null,
            end_date: data.checkOut ? String(data.checkOut).slice(0, 10) : null,
            dropoff_time: data.dropoffTime || null,
            pickup_time: data.pickupTime || null,
            amount: Number(data.price || 0),
            price: Number(data.price || 0),
            notes: data.notes || null,
          };

          const editingId = editVisitDraft?.id ?? selectedVisit?.id ?? null;

          if (isEditingVisit && editingId) {
            const { data: updated, error } = await supabase
              .from("visits")
              .update(payload)
              .eq("id", editingId)
              .select("*")
              .single();

            if (error) {
              console.error("Update visit error:", error);
              alert("Save failed - check console.");
              return;
            }

            setVisits(
              visits.map((v: any) => (v.id === editingId ? updated : v))
            );
            setAdd(false);
            setIsEditingVisit(false);
            setEditVisitDraft(null);
            setSelectedVisit(updated);
          } else {
            const { data: inserted, error } = await supabase
              .from("visits")
              .insert([payload])
              .select("*")
              .single();

            if (error) {
              console.error("Insert visit error:", error);
              alert("Save failed - check console.");
              return;
            }

            setAdd(false);
          }
        }}
      />
    );

  return (
    <div className="space-y-6">
      <button
        onClick={() => setAdd(true)}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
      >
        + Log Visit
      </button>
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="px-3 py-1 bg-stone-200 rounded">
          ←
        </button>

        <h2 className="text-lg font-medium">{monthLabel}</h2>

        <button onClick={nextMonth} className="px-3 py-1 bg-stone-200 rounded">
          →
        </button>
      </div>
      <div className="space-y-3">
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNumber = i + 1;
          const dateString = `${currentYear}-${String(
            currentMonthIndex + 1
          ).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

          const dayVisits = visits.filter((v: any) => {
            const rowType = String(
              v.service_type ?? v.serviceType ?? v.service ?? ""
            )
              .trim()
              .toLowerCase();

            const rowCheckIn = String(v.start_date ?? v.checkIn ?? "").slice(
              0,
              10
            );
            const rowCheckOut = String(v.end_date ?? v.checkOut ?? "").slice(
              0,
              10
            );

            if (rowType === "boarding" && rowCheckIn && rowCheckOut) {
              return dateString >= rowCheckIn && dateString <= rowCheckOut;
            }

            return (
              String(v.start_date ?? v.date ?? "").slice(0, 10) === dateString
            );
          });
          // ---- sort dayVisits by time (earliest -> latest) ----
          const timeToMinutes = (val: any): number => {
            if (val == null) return Number.POSITIVE_INFINITY;

            // If it's already a Date
            if (val instanceof Date && !isNaN(val.getTime())) {
              return val.getHours() * 60 + val.getMinutes();
            }

            const s = String(val).trim();
            if (!s) return Number.POSITIVE_INFINITY;

            // If it's an ISO datetime like "2026-02-18T05:30:00" or "2026-02-18 17:45"
            const isoMatch =
              s.match(/T(\d{1,2}):(\d{2})(?::(\d{2}))?/i) ||
              s.match(/\b(\d{1,2}):(\d{2})(?::(\d{2}))?\b/);
            // But avoid matching plain dates like "2026-02-18"
            if (isoMatch && !/^\d{4}-\d{2}-\d{2}$/.test(s)) {
              const hh = parseInt(isoMatch[1], 10);
              const mm = parseInt(isoMatch[2], 10);
              if (!Number.isNaN(hh) && !Number.isNaN(mm)) return hh * 60 + mm;
            }

            // Matches "5:30 AM", "6PM", "6:30PM", "17:45", "05:30"
            const m = s.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i);
            if (!m) return Number.POSITIVE_INFINITY;

            let hh = parseInt(m[1], 10);
            const mm = parseInt(m[2] ?? "0", 10);
            const ap = (m[3] ?? "").toLowerCase();

            if (Number.isNaN(hh) || Number.isNaN(mm))
              return Number.POSITIVE_INFINITY;

            // convert AM/PM if present
            if (ap === "pm" && hh !== 12) hh += 12;
            if (ap === "am" && hh === 12) hh = 0;

            return hh * 60 + mm;
          };

          // Pick the best TIME field (not date fields)
          const getVisitMinutes = (v: any): number => {
            // Add/remove candidates here if your DB uses different names
            return timeToMinutes(
              v.start_time ??
                v.startTime ??
                v.dropoff_time ??
                v.dropoffTime ??
                v.time ??
                v.check_in_time ??
                v.checkInTime ??
                v.pickup_time ??
                v.pickupTime
            );
          };

          const dayVisitsSorted = [...dayVisits].sort((a, b) => {
            const am = getVisitMinutes(a);
            const bm = getVisitMinutes(b);
            if (am !== bm) return am - bm;

            // tie-breaker so sort is stable
            const aKey = String(a.id ?? a.created_at ?? "");
            const bKey = String(b.id ?? b.created_at ?? "");
            return aKey.localeCompare(bKey);
          });

          return (
            <div
              key={dayNumber}
              className="border rounded-lg p-3 bg-white shadow-sm"
            >
              <div className="font-semibold mb-2">
                {new Date(dateString + "T12:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </div>

              {dayVisitsSorted.map((v: any) => {
                const typeRaw = String(
                  v.service_type ??
                    v.serviceType ??
                    v.type ??
                    v.service ??
                    v.service_type_name ??
                    ""
                )
                  .trim()
                  .toLowerCase();

                const type =
                  typeRaw.includes("meet") || typeRaw.includes("greet")
                    ? "meet-greet"
                    : typeRaw.includes("board")
                    ? "boarding"
                    : "daycare";

                const checkIn = String(v.start_date ?? v.checkIn ?? "").slice(
                  0,
                  10
                );
                const checkOut = String(v.end_date ?? v.checkOut ?? "").slice(
                  0,
                  10
                );

                const isCheckIn = type === "boarding" && checkIn === dateString;
                const isCheckOut =
                  type === "boarding" && checkOut === dateString;
                //   console.log("VISIT OBJECT (for time fields):", v);
                //  console.log(
                "VISIT KEYS:",
                  Object.keys(v),
                  "DATA KEYS:",
                  Object.keys(v?.data ?? {}),
                  "DATA:",
                  v?.data;
                //   );

                let badgeColor = "bg-gray-100 text-gray-700";
                if (type === "daycare")
                  badgeColor = "bg-blue-100 text-blue-800";
                else if (type === "meet & greet" || type === "meet-greet")
                  badgeColor = "bg-purple-100 text-purple-800";
                else if (isCheckIn) badgeColor = "bg-green-100 text-green-800";
                else if (isCheckOut) badgeColor = "bg-red-100 text-red-800";
                const startT = fmtTime(v.dropoff_time ?? v.checkIn ?? "");
                const endT = fmtTime(v.pickup_time ?? v.checkOut ?? "");

                let timeText = "";
                if (type === "daycare") {
                  timeText =
                    startT && endT ? `${startT}-${endT}` : startT || endT;
                } else if (type === "boarding") {
                  timeText = isCheckIn ? startT : isCheckOut ? endT : "";
                } else if (type === "meet & greet" || type === "meet-greet") {
                  timeText = startT;
                }

                const badgeLetter =
                  type === "boarding" ? "B" : type === "daycare" ? "D" : "M";

                const dogId =
                  v.dog_id ??
                  v.dogId ??
                  v.dog?.id ??
                  v.dog?.dog_id ??
                  v.data?.dog_id ??
                  v.data?.dogId;

                const matchedDog = dogs.find(
                  (d: any) => String(d.id) === String(dogId)
                );

                const displayName =
                  v.dog_name ||
                  v.dogName ||
                  matchedDog?.dog_name ||
                  matchedDog?.name ||
                  matchedDog?.data?.dog_name ||
                  matchedDog?.data?.name ||
                  (dogId ? `Unknown (dog_id: ${dogId})` : "Unknown");

                return (
                  <div
                    key={v.id}
                    role="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      console.log("CLICKED VISIT ✅", v);
                      setSelectedVisit(v);
                    }}
                    className={`text-sm px-2 py-1 rounded mb-1 ${badgeColor}`}
                  >
                    {displayName} - {badgeLetter}
                    {timeText && (
                      <div className="text-xs opacity-70">{timeText}</div>
                    )}
                  </div>
                );
              })}

              {dayVisits.length === 0 && (
                <div className="text-xs text-stone-400">No visits</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <h2 className="text-2xl font-light">Visit Log</h2>
        <button
          onClick={() => setAdd(true)}
          className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-sm flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Visit</span>
        </button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { l: "All", v: "all" },
          { l: "Boarding", v: "boarding" },
          { l: "Daycare", v: "daycare" },
          { l: "Meet & Greet", v: "meet-greet" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${
              filter === f.v
                ? "bg-emerald-800 text-white"
                : "bg-stone-200 text-stone-600"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-100 border-b border-stone-200">
              <tr>
                {["Date", "Member", "Service", "Add-ons", "Price", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-stone-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered
                .slice()
                .reverse()
                .map((v) => {
                  const dogId = v.dog_id ?? v.dogId;

                  const matchedDog = dogs.find(
                    (d: any) => String(d.id) === String(dogId)
                  );

                  const displayName =
                    v.dog_name ||
                    v.dogName ||
                    matchedDog?.dog_name ||
                    matchedDog?.name ||
                    matchedDog?.data?.dog_name ||
                    matchedDog?.data?.name ||
                    (dogId ? `Unknown (dog_id: ${dogId})` : "Unknown");
                  const addons = [];
                  if (v.transport) addons.push("Transport $65");
                  if (v.bath) addons.push("Bath $40");
                  if (v.nails) addons.push("Nails $15");
                  return (
                    <tr key={v.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {v.checkIn ? `${v.checkIn} to ${v.checkOut}` : v.date}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {displayName}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize whitespace-nowrap">
                        {v.serviceType}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex flex-wrap gap-1">
                          {addons.map((a, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded whitespace-nowrap"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-700 whitespace-nowrap">
                        ${v.price?.toFixed(0)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={async () => {
                            if (!confirm("Delete?")) return;

                            const { error } = await supabase
                              .from("visits")
                              .delete()
                              .eq("id", v.id);

                            if (error) {
                              console.error("Visit delete error:", error);
                              alert("Delete failed — check console.");
                              return;
                            }

                            setVisits((prev) =>
                              prev.filter((x) => x.id !== v.id)
                            );
                          }}
                          className="text-xs text-red-600 whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {selectedVisit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
              <h2 className="text-xl font-semibold mb-2">
                {selectedVisit.dog_name}
              </h2>

              {(() => {
                const dog =
                  (dogs ?? []).find(
                    (d: any) => d.id === (selectedVisit as any).dog_id
                  ) ??
                  (dogs ?? []).find(
                    (d: any) =>
                      (d.dog_name ?? d.data?.name) ===
                      (selectedVisit as any).dog_name
                  ) ??
                  null;

                const service =
                  (selectedVisit as any).service_type ??
                  (selectedVisit as any).service ??
                  (selectedVisit as any).data?.service_type ??
                  "-";

                const start =
                  (selectedVisit as any).start_date ??
                  (selectedVisit as any).startDate ??
                  (selectedVisit as any).checkIn ??
                  "-";

                const end =
                  (selectedVisit as any).end_date ??
                  (selectedVisit as any).endDate ??
                  (selectedVisit as any).checkOut ??
                  "-";

                const owner =
                  (selectedVisit as any).owner_name ??
                  (selectedVisit as any).data?.owner_name ??
                  dog?.owner_name ??
                  dog?.data?.owner ??
                  dog?.owner ??
                  "-";

                const phone =
                  (selectedVisit as any).owner_phone ??
                  (selectedVisit as any).data?.owner_phone ??
                  (selectedVisit as any).phone ??
                  dog?.owner_phone ??
                  dog?.data?.owner_phone ??
                  dog?.data?.phone ??
                  dog?.phone ??
                  "-";

                return (
                  <>
                    <p>Service: {service}</p>
                    <p>Start: {start}</p>
                    <p>End: {end}</p>
                    <p>Owner: {owner}</p>
                    <p>Phone: {phone}</p>
                    <p>
                      Price:{" "}
                      {selectedVisit?.price != null
                        ? `$${Number(selectedVisit.price).toLocaleString()}`
                        : selectedVisit?.amount != null
                        ? `$${Number(selectedVisit.amount).toLocaleString()}`
                        : "-"}
                    </p>
                  </>
                );
              })()}

              <button
                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
                onClick={() => setSelectedVisit(null)}
              >
                Close
              </button>
              <button
                className="ml-2 px-4 py-2 rounded bg-stone-200 hover:bg-stone-300"
                onClick={() => {
                  if (!selectedVisit) return;
                  setIsEditingVisit(true);
                  setEditVisitDraft({
                    ...selectedVisit,
                    dogId: selectedVisit.dog_id ?? selectedVisit.dogId ?? "",
                    serviceType:
                      selectedVisit.service_type ?? selectedVisit.service ?? "",
                    // make sure these exist in the draft even if missing on the row
                    start_date: selectedVisit.start_date ?? "",
                    end_date: selectedVisit.end_date ?? "",
                    dropoff_time:
                      selectedVisit.dropoff_time ?? selectedVisit.checkIn ?? "",
                    pickup_time:
                      selectedVisit.pickup_time ?? selectedVisit.checkOut ?? "",
                    service:
                      selectedVisit.service ?? selectedVisit.service_type ?? "",
                  });
                  setIsEditing(true);
                  setAdd(true);
                }}
              >
                Edit
              </button>
              <button
                className="ml-2 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  if (!selectedVisit) return;

                  const confirmDelete = window.confirm("Delete this visit?");
                  if (!confirmDelete) return;

                  const { error } = await supabase
                    .from("visits")
                    .delete()
                    .eq("id", selectedVisit.id);

                  if (error) {
                    alert("Delete failed");
                    return;
                  }

                  setVisits(visits.filter((v) => v.id !== selectedVisit.id));
                  setSelectedVisit(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">No visits found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// TEMP COMMENT OUT VisitForm
function VisitForm({ dogs, onSave, onCancel, initialData, mode }) {
  const today = new Date().toISOString().split("T")[0];
  const [dogSearch, setDogSearch] = useState("");
  const [data, setData] = useState(() => {
    const empty = {
      dogId: "",
      serviceType: "boarding",
      checkIn: "",
      checkOut: "",
      date: today,
      dropoffTime: "",
      pickupTime: "",
      price: "",
      transport: false,
      bath: false,
      nails: false,
      notes: "",
    };

    if (!initialData) return empty;

    const serviceType = (initialData.service_type ??
      initialData.serviceType ??
      initialData.service ??
      "boarding") as any;

    const checkIn = String(initialData.start_date ?? initialData.checkIn ?? "");
    const checkOut = String(initialData.end_date ?? initialData.checkOut ?? "");
    const dropoffTime = String(
      initialData.dropoff_time ??
        initialData.dropoffTime ??
        initialData.checkIn ??
        ""
    );
    const pickupTime = String(
      initialData.pickup_time ??
        initialData.pickupTime ??
        initialData.checkOut ??
        ""
    );

    // ---- PRICE FIX: DB price is TOTAL; form price is PER-NIGHT (boarding) ----
    const total = Number(initialData.price ?? initialData.amount ?? 0) || 0;

    let basePrice = total;

    if (serviceType === "boarding" && checkIn && checkOut && total) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const nights = Math.max(
        1,
        Math.round((end.getTime() - start.getTime()) / 86400000)
      );
      basePrice = total / nights;
    }

    return {
      ...empty,
      dogId: initialData.dog_id ? String(initialData.dog_id) : "",
      serviceType,
      checkIn,
      checkOut,
      date: checkIn || today,
      dropoffTime,
      pickupTime,
      price: basePrice ? String(basePrice.toFixed(2)) : "",
      transport: Boolean(initialData.transport),
      bath: Boolean(initialData.bath),
      nails: Boolean(initialData.nails),
      notes: initialData.notes ?? "",
    };
  });

  const calculatePrice = () => {
    let base = parseFloat(data.price) || 0;

    // calculate number of nights
    let nights = 1;

    if (data.checkIn && data.checkOut) {
      const start = new Date(data.checkIn);
      const end = new Date(data.checkOut);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      nights = diffDays > 0 ? diffDays : 1;
    }

    let addons = 0;
    if (data.transport) addons += 65;
    if (data.bath) addons += 40;
    if (data.nails) addons += 15;

    return base * nights + addons;
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-6">
      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-light">Log Visit</h2>
        <button onClick={onCancel} className="text-stone-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-stone-600 mb-1">Member *</label>
          <Select
            options={dogs.map((d: any) => ({
              value: d.id,
              label: `${d.name ?? d.data?.name ?? "Unnamed"} (${
                d.owner_name ?? d.data?.owner ?? ""
              })`,
            }))}
            value={
              dogs
                .map((d: any) => ({
                  value: d.id,
                  label: `${d.name ?? d.data?.name ?? "Unnamed"} (${
                    d.owner_name ?? d.data?.owner ?? ""
                  })`,
                }))
                .find((option: any) => option.value === data.dogId) || null
            }
            onChange={(selected: any) =>
              setData({ ...data, dogId: selected?.value || "" })
            }
            placeholder="Search for a dog..."
            isSearchable
          />
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-1">
            Service Type *
          </label>
          <select
            required
            value={data.serviceType}
            onChange={(e) => setData({ ...data, serviceType: e.target.value })}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
          >
            <option value="boarding">Boarding</option>
            <option value="daycare">Daycare</option>
            <option value="meet-greet">Meet & Greet</option>
          </select>
        </div>

        {data.serviceType === "boarding" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Check-In Date *
              </label>
              <input
                type="date"
                required
                value={data.checkIn}
                onChange={(e) => setData({ ...data, checkIn: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Check-Out Date *
              </label>
              <input
                type="date"
                required
                value={data.checkOut}
                onChange={(e) => setData({ ...data, checkOut: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Drop-off Time
              </label>
              <input
                type="time"
                value={data.dropoffTime}
                onChange={(e) =>
                  setData({ ...data, dropoffTime: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Pick-up Time
              </label>
              <input
                type="time"
                value={data.pickupTime}
                onChange={(e) =>
                  setData({ ...data, pickupTime: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-600 mb-1">Time</label>
              <input
                type="time"
                value={data.dropoffTime}
                onChange={(e) =>
                  setData({ ...data, dropoffTime: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-stone-600 mb-1">
            Base Price ($) *
          </label>
          <input
            type="number"
            required
            step="0.01"
            value={data.price}
            onChange={(e) => setData({ ...data, price: e.target.value })}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-2">
            Add-on Services
          </label>
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                k: "transport",
                l: "Round-Trip Transport",
                i: Truck,
                p: "$65",
              },
              { k: "bath", l: "Exit Bath", i: Bath, p: "$40" },
              { k: "nails", l: "Nail Trim", i: Scissors, p: "$15" },
            ].map((f) => (
              <label
                key={f.k}
                className="flex items-center justify-between p-3 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={data[f.k]}
                    onChange={(e) =>
                      setData({ ...data, [f.k]: e.target.checked })
                    }
                    className="rounded text-emerald-600"
                  />
                  <f.i className="w-4 h-4 text-stone-600" />
                  <span className="text-sm text-stone-700">{f.l}</span>
                </div>
                <span className="text-sm font-medium text-emerald-700">
                  {f.p}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-emerald-900">
              Total Price
            </span>
            <span className="text-2xl font-light text-emerald-900">
              ${calculatePrice().toFixed(2)}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone-600 mb-1">Notes</label>
          <textarea
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded text-sm focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={() => onSave({ ...data, price: calculatePrice() })}
            className="flex-1 py-2.5 bg-emerald-800 text-white rounded-lg text-sm"
          >
            Save Visit
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-2.5 bg-stone-200 text-stone-700 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
// END TEMP COMMENT
function Analytics({ visits }: { visits: any[] }) {
  const [view, setView] = useState<"monthly" | "yearly">("monthly");
  // ===== 1. HARD-LOCKED HISTORICAL DATA =====
  const historicalMonthly: Record<string, number> = {
    "2024-07": 6550,
    "2024-08": 33900,
    "2024-09": 3450,
    "2024-10": 5550,
    "2024-11": 8175,
    "2024-12": 8700,
    "2025-01": 4150,
    "2025-02": 7575,
    "2025-03": 4575,
    "2025-04": 10500,
    "2025-05": 13050,
    "2025-06": 6600,
    "2025-07": 15225,
    "2025-08": 19350,
    "2025-09": 14775,
    "2025-10": 16275,
    "2025-11": 17675,
    "2025-12": 26625,
    "2026-01": 17550,
  };

  // ===== 2. Helper to get month key =====
  const getMonthKey = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // ===== 3. Build dynamic months (Feb 2026 and forward only) =====
  const dynamicMonthly: Record<string, number> = {};

  (visits || []).forEach((v: any) => {
    const key =
      getMonthKey(v.start_date) ||
      getMonthKey(v.date) ||
      getMonthKey(v.check_in);

    if (!key) return;

    // DO NOT touch historical or Jan 2026
    if (key <= "2026-01") return;

    const amt = Number(v.amount) || Number(v.price) || Number(v.total) || 0;

    if (!amt) return;

    dynamicMonthly[key] = (dynamicMonthly[key] || 0) + amt;
  });

  // ===== 4. Merge historical + dynamic =====
  const finalMonthly: Record<string, number> = {
    ...historicalMonthly,
    ...dynamicMonthly,
  };
  // Build yearly totals from finalMonthly
  const yearlyTotals: Record<string, number> = {};

  Object.entries(finalMonthly).forEach(([key, value]) => {
    const year = key.split("-")[0];
    yearlyTotals[year] = (yearlyTotals[year] || 0) + value;
  });
  // ===== 5. Sort newest first =====
  const sortedMonths = Object.entries(finalMonthly).sort((a, b) =>
    a[0] < b[0] ? 1 : -1
  );

  return (
    <div>
      <div style={{ marginBottom: "16px", display: "flex", gap: "8px" }}>
        <button
          onClick={() => setView("monthly")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: view === "monthly" ? "#14532d" : "#e5e7eb",
            color: view === "monthly" ? "white" : "black",
            fontWeight: 600,
          }}
        >
          Monthly
        </button>

        <button
          onClick={() => setView("yearly")}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: view === "yearly" ? "#14532d" : "#e5e7eb",
            color: view === "yearly" ? "white" : "black",
            fontWeight: 600,
          }}
        >
          Yearly
        </button>
      </div>
      {view === "monthly" && (
        <>
          <h2>Monthly Revenue</h2>
          {sortedMonths.map(([key, value]) => (
            <div
              key={key}
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>
                {new Date(
                  Date.UTC(
                    Number(key.slice(0, 4)),
                    Number(key.slice(5, 7)) - 1,
                    1
                  )
                ).toLocaleString("default", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
              <span>${value.toLocaleString()}</span>
            </div>
          ))}
        </>
      )}
      {view === "yearly" && (
        <div>
          <h2>Yearly Revenue</h2>
          {Object.entries(yearlyTotals)
            .sort((a, b) => (a[0] < b[0] ? 1 : -1))
            .map(([year, value]) => (
              <div
                key={year}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>{year}</span>
                <span>${value.toLocaleString()}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
