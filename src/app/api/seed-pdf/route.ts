import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch active profiles to resolve IDs
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("id, full_name, email");

    if (pError) {
      return NextResponse.json({ error: "Failed to fetch profiles: " + pError.message }, { status: 500 });
    }

    const getEmpId = (name: string) => {
      const p = profiles.find((pr) => pr.full_name.toLowerCase().includes(name.toLowerCase()));
      if (!p) throw new Error(`Profile not found for: ${name}`);
      return p.id;
    };

    // 2. Define support logs to insert (including target scores from PDF)
    const supportLogs = [
      // 01-Jul-26
      { name: "Lalit", date: "2026-07-01", status: "present", tickets: 9, chats: 0, notes: "Canned Response Update", score: 5 },
      { name: "Rupali", date: "2026-07-01", status: "present", tickets: 6, chats: 2, notes: "Bug Verification", score: 5 },
      { name: "Prathamesh", date: "2026-07-01", status: "present", tickets: 4, chats: 0, notes: "", score: 4 },
      { name: "Gaurav", date: "2026-07-01", status: "present", tickets: 3, chats: 0, notes: "", score: 4 },

      // 02-Jul-26
      { name: "Lalit", date: "2026-07-02", status: "present", tickets: 10, chats: 1, notes: "Customer Follow-up", score: 5 },
      { name: "Rupali", date: "2026-07-02", status: "present", tickets: 1, chats: 2, notes: "Documentation Update Spreadr", score: 4 },
      { name: "Prathamesh", date: "2026-07-02", status: "present", tickets: 5, chats: 0, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-02", status: "present", tickets: 3, chats: 2, notes: "", score: 5 },

      // 03-Jul-26
      { name: "Lalit", date: "2026-07-03", status: "present", tickets: 6, chats: 2, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-03", status: "present", tickets: 2, chats: 0, notes: "Customer Follow-up", score: 4 },
      { name: "Prathamesh", date: "2026-07-03", status: "present", tickets: 4, chats: 4, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-03", status: "present", tickets: 3, chats: 0, notes: "", score: 4 },

      // 06-Jul-26
      { name: "Lalit", date: "2026-07-06", status: "present", tickets: 6, chats: 2, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-06", status: "present", tickets: 1, chats: 5, notes: "Documentation Update Spreadr", score: 5 },
      { name: "Prathamesh", date: "2026-07-06", status: "present", tickets: 3, chats: 2, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-06", status: "present", tickets: 3, chats: 0, notes: "", score: 4 },

      // 07-Jul-26
      { name: "Lalit", date: "2026-07-07", status: "present", tickets: 7, chats: 2, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-07", status: "present", tickets: 1, chats: 3, notes: "Half Day", score: 4 }, // Half day
      { name: "Prathamesh", date: "2026-07-07", status: "present", tickets: 3, chats: 1, notes: "", score: 4 },
      { name: "Gaurav", date: "2026-07-07", status: "present", tickets: 3, chats: 1, notes: "", score: 4 },

      // 08-Jul-26
      { name: "Lalit", date: "2026-07-08", status: "present", tickets: 2, chats: 4, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-08", status: "present", tickets: 4, chats: 5, notes: "", score: 4 },
      { name: "Prathamesh", date: "2026-07-08", status: "present", tickets: 1, chats: 2, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-08", status: "present", tickets: 6, chats: 0, notes: "", score: 5 },

      // 09-Jul-26
      { name: "Lalit", date: "2026-07-09", status: "leave", tickets: 0, chats: 0, notes: "", score: null },
      { name: "Rupali", date: "2026-07-09", status: "present", tickets: 10, chats: 5, notes: "Documentation Update sleek - import/export feature", score: 5 },
      { name: "Prathamesh", date: "2026-07-09", status: "present", tickets: 1, chats: 4, notes: "", score: 4 },
      { name: "Gaurav", date: "2026-07-09", status: "present", tickets: 6, chats: 0, notes: "", score: 5 },

      // 10-Jul-26
      { name: "Lalit", date: "2026-07-10", status: "present", tickets: 8, chats: 0, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-10", status: "present", tickets: 9, chats: 3, notes: "", score: 5 },
      { name: "Prathamesh", date: "2026-07-10", status: "present", tickets: 9, chats: 0, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-10", status: "leave", tickets: 0, chats: 0, notes: "", score: null },

      // 13-Jul-26
      { name: "Lalit", date: "2026-07-13", status: "present", tickets: 8, chats: 0, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-13", status: "leave", tickets: 0, chats: 0, notes: "", score: null },
      { name: "Prathamesh", date: "2026-07-13", status: "present", tickets: 8, chats: 7, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-13", status: "present", tickets: 6, chats: 0, notes: "", score: 5 },

      // 14-Jul-26
      { name: "Lalit", date: "2026-07-14", status: "present", tickets: 1, chats: 1, notes: "", score: 4 },
      { name: "Rupali", date: "2026-07-14", status: "leave", tickets: 0, chats: 0, notes: "", score: null },
      { name: "Prathamesh", date: "2026-07-14", status: "present", tickets: 7, chats: 10, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-14", status: "present", tickets: 5, chats: 0, notes: "", score: 5 },

      // 15-Jul-26
      { name: "Lalit", date: "2026-07-15", status: "present", tickets: 7, chats: 2, notes: "", score: 5 },
      { name: "Rupali", date: "2026-07-15", status: "leave", tickets: 0, chats: 0, notes: "", score: null },
      { name: "Prathamesh", date: "2026-07-15", status: "present", tickets: 3, chats: 5, notes: "", score: 5 },
      { name: "Gaurav", date: "2026-07-15", status: "present", tickets: 2, chats: 0, notes: "", score: 4 },

      // 16-Jul-26
      { name: "Lalit", date: "2026-07-16", status: "present", tickets: 13, chats: 1, notes: "Documentation Update Shipr", score: 5 },
      { name: "Rupali", date: "2026-07-16", status: "leave", tickets: 0, chats: 0, notes: "", score: null },
      { name: "Prathamesh", date: "2026-07-16", status: "present", tickets: 12, chats: 0, notes: "Documentation Update Dual, clever and Neo", score: 5 },
      { name: "Gaurav", date: "2026-07-16", status: "present", tickets: 6, chats: 0, notes: "Documentation Update Smart", score: 5 },

      // 17-Jul-26
      { name: "Rupali", date: "2026-07-17", status: "leave", tickets: 0, chats: 0, notes: "", score: null },
    ];

    // 3. Define testing logs to insert
    const testingLogs = [
      // 01-Jul-26
      { name: "Lalit", date: "2026-07-01", appName: "Bolt App", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 3, notes: "" },
      { name: "Rupali", date: "2026-07-01", appName: "spreadr", module: "import by seller feature", status: "completed", bugs: 1, critical: 0, quality: 5, notes: "" },
      { name: "Prathamesh", date: "2026-07-01", appName: "Pro", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Gaurav", date: "2026-07-01", appName: "Pro", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },

      // 02-Jul-26
      { name: "Lalit", date: "2026-07-02", appName: "Bolt App", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Rupali", date: "2026-07-02", appName: "spreadr", module: "bulk import resetting values", status: "completed", bugs: 1, critical: 0, quality: 5, notes: "" },
      { name: "Prathamesh", date: "2026-07-02", appName: "Duplicate", module: "Laravel", status: "completed", bugs: 2, critical: 0, quality: 5, notes: "" },
      { name: "Gaurav", date: "2026-07-02", appName: "Duplicate", module: "Laravel", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },

      // 03-Jul-26
      { name: "Lalit", date: "2026-07-03", appName: "Bolt App", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Rupali", date: "2026-07-03", appName: "Prime / Pro / Spreadr", module: "1) prime countdown timer re-testing on prod, 2) pro app Preview Calculations on live/selected product testing, 3) spreadr creator api settings related testing for bulk import, 4) follow up emails to pro users for 250 variant support, 5) 250 variant support - faq updation for pro and exporter app", status: "completed", bugs: 5, critical: 0, quality: 5, notes: "" },

      // 06-Jul-26
      { name: "Lalit", date: "2026-07-06", appName: "Bolt App", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Rupali", date: "2026-07-06", appName: "Pro", module: "live preview re-testing", status: "completed", bugs: 5, critical: 0, quality: 5, notes: "" },
      { name: "Prathamesh", date: "2026-07-06", appName: "Duplicate", module: "Laravel", status: "completed", bugs: 2, critical: 0, quality: 5, notes: "" },
      { name: "Gaurav", date: "2026-07-06", appName: "duplicate / watchlyst", module: "Admin Testing", status: "completed", bugs: 3, critical: 0, quality: 5, notes: "" },

      // 07-Jul-26
      { name: "Lalit", date: "2026-07-07", appName: "Bolt App", module: "250 Variants", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Prathamesh", date: "2026-07-07", appName: "Bolt", module: "Product Preview", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Gaurav", date: "2026-07-07", appName: "Duplicate", module: "Product Preview", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },

      // 08-Jul-26
      { name: "Lalit", date: "2026-07-08", appName: "Prime", module: "Admin Testing", status: "completed", bugs: 3, critical: 0, quality: 5, notes: "" },
      { name: "Rupali", date: "2026-07-08", appName: "spreadr", module: "bugs testing on prod", status: "completed", bugs: 3, critical: 0, quality: 5, notes: "" },
      { name: "Prathamesh", date: "2026-07-08", appName: "Bolt", module: "Product Preview", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Gaurav", date: "2026-07-08", appName: "General testing", module: "Product Preview", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },

      // 09-Jul-26
      { name: "Rupali", date: "2026-07-09", appName: "prime", module: "pagination for \"selected products\"", status: "completed", bugs: 1, critical: 0, quality: 5, notes: "" },
      { name: "Prathamesh", date: "2026-07-09", appName: "Bolt", module: "Product Preview", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
      { name: "Gaurav", date: "2026-07-09", appName: "Duplicate", module: "Product Preview", status: "completed", bugs: 0, critical: 0, quality: 5, notes: "" },
    ];

    // Get unique combinations of employee_id and log_date to delete
    const supportDates = Array.from(new Set(supportLogs.map((l) => l.date)));
    const supportEmpIds = Array.from(new Set(supportLogs.map((l) => getEmpId(l.name))));

    // 4. Delete existing support logs
    await supabase
      .from("daily_support_logs")
      .delete()
      .in("employee_id", supportEmpIds)
      .in("log_date", supportDates);

    // 5. Delete existing testing logs
    const testingDates = Array.from(new Set(testingLogs.map((l) => l.date)));
    const testingEmpIds = Array.from(new Set(testingLogs.map((l) => getEmpId(l.name))));

    await supabase
      .from("daily_testing_logs")
      .delete()
      .in("employee_id", testingEmpIds)
      .in("log_date", testingDates);

    // 6. Map and Insert Support Logs
    const mappedSupport = supportLogs.map((log) => ({
      employee_id: getEmpId(log.name),
      log_date: log.date,
      attendance_status: log.status,
      tickets_handled: log.tickets,
      chats_handled: log.chats,
      notes: log.notes || null,
      ticket_rating: log.score,
      chat_rating: log.score,
      documentation_rating: log.score,
    }));

    const { error: sInsertError } = await supabase
      .from("daily_support_logs")
      .insert(mappedSupport);

    if (sInsertError) {
      return NextResponse.json({ error: "Failed to insert support logs: " + sInsertError.message }, { status: 500 });
    }

    // 7. Map and Insert Testing Logs
    const mappedTesting = testingLogs.map((log) => {
      let quality: "excellent" | "good" | "average" | "poor" = "good";
      if (log.quality === 5) quality = "excellent";
      else if (log.quality === 4) quality = "good";
      else if (log.quality === 3) quality = "average";
      else if (log.quality <= 2) quality = "poor";

      return {
        employee_id: getEmpId(log.name),
        log_date: log.date,
        application_name: log.appName,
        module_name: log.module || "General",
        testing_task: "Product Testing",
        testing_type: "functional",
        status: log.status,
        bugs_found: log.bugs,
        critical_bugs_found: log.critical,
        testing_quality: quality,
        notes: log.notes || null,
      };
    });

    const { error: tInsertError } = await supabase
      .from("daily_testing_logs")
      .insert(mappedTesting);

    if (tInsertError) {
      return NextResponse.json({ error: "Failed to insert testing logs: " + tInsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, insertedSupport: supportLogs.length, insertedTesting: testingLogs.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
