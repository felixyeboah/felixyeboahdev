import Link from "next/link";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

function getPosts() {
  const docsDir = path.join(process.cwd(), "src/content/blog");
  if (!fs.existsSync(docsDir)) return [];
  
  const entries = fs.readdirSync(docsDir, { withFileTypes: true });

  const posts = entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => {
      const fullPath = path.join(docsDir, dir.name, "page.mdx");
      if (!fs.existsSync(fullPath)) return null;

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      if (!data.title) return null;

      const dateString = data.date ? data.date : "1970-01-01T00:00:00.000Z";
      const date = new Date(dateString);

      return {
        slug: dir.name,
        title: data.title,
        date,
        formattedDate: date.toLocaleDateString("en-US", { year: 'numeric', month: 'short' })
      };
    })
    .filter((post): post is NonNullable<typeof post> => post !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return posts;
}

export default function Home() {
  const posts = getPosts();

  return (
    <main className="space-y-16 pb-20 text-base">
      <section>
        <p className="leading-relaxed">
          A software developer building things for the web and mobile. I consider
          myself a life-long learner. Over the years, I've been building
          functional, beautiful interfaces and experiences that leave a positive
          impact on people and businesses. Currently, I am building{" "}
          <Link
            href="https://reevit.io"
            target="_blank"
            className="underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground transition-colors"
          >
            Reevit
          </Link>
          {' '} as a side project to provides one API with routing, retries, billing, and telemetry so teams can accept payments, automate subscriptions, and fail over between payment service providers (PSPs) without re-writing code.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="font-semibold">Experience</h2>
        <div className="flex flex-col space-y-4">
          {[
            { role: "Senior Frontend Engineer", company: "Complete Farmer LTD", date: "2019—" },
            { role: "Frontend Engineer", company: "Primer", date: "2022" },
            { role: "Frontend Developer", company: "Bee and Bloom", date: "2018—2020" },
          ].map((job, i) => (
            <div key={i} className="flex justify-between items-baseline">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span>{job.role}</span>
                <span className="text-foreground/60 text-sm">{job.company}</span>
              </div>
              <span className="text-foreground/60 text-sm tabular-nums text-right">
                {job.date}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-semibold">Projects</h2>
        <div className="flex flex-col space-y-4">
          {[
            { name: "Reevit", url: "https://reevit.io/", category: "Payments" },
            { name: "Miss Cookie Spices", url: "https://misscookieghana.com/", category: "E-commerce" },
            { name: "Waytu", url: "https://www.waytu.io/", category: "Ride-sharing" },
            { name: "Studio Theon", url: "https://www.studiotheon.com/", category: "Agency" },
            { name: "Drobotix", url: "https://drobotixas.com/", category: "Ag-Tech Drones" },
            { name: "Dronehub", url: "https://dronehub.vercel.app/", category: "Drones" },
            { name: "UAVOps", url: "https://uavops.vercel.app/", category: "Aerial Data" },
            { name: "Blavior", url: "https://blavior.vercel.app/", category: "Software" },
            { name: "The Rumson", url: "https://therumson-web.vercel.app/", category: "Restaurant" },
            { name: "7even Sports Group", url: "https://7evensportsgroup.com", category: "Sports" },
            { name: "Push & Pull Cosmetics", url: "https://www.pnpcosmetics.com", category: "Skincare" },
            { name: "Dasheen Atelier", url: "https://dasheenatelier.com/", category: "Fashion" },
            { name: "Janatribe", url: "https://janatribe.vercel.app/", category: "Wedding Platform" },
            { name: "CSS", url: "https://techbycss.com/", category: "Tech Solutions" },
            { name: "The Arck Interior LTD", url: "https://thearckinteriorltd.com/", category: "Interior Design" },
            { name: "Desmond Weds Akyeamaa", url: "https://dna-8a83.fly.dev", category: "Wedding" },
            { name: "Undisciplined", url: "https://undisciplined.xyz/", category: "Studio" },
          ].map((project) => (
            <Link
              key={project.name}
              href={project.url}
              target="_blank"
              className="group flex justify-between items-baseline"
            >
              <span className="underline decoration-foreground/30 underline-offset-4 group-hover:decoration-foreground transition-colors">
                {project.name}
              </span>
              <span className="text-foreground/60 text-sm hidden sm:inline-block">
                {project.category}
              </span>
            </Link>
            ))}
        </div>
      </section>

      {posts.length > 0 && (
        <section className="space-y-6">
          <h2 className="font-semibold">Writing</h2>
          <div className="flex flex-col space-y-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/docs/${post.slug}`}
                className="group flex justify-between items-baseline gap-4"
              >
                <span className="underline decoration-foreground/30 underline-offset-4 group-hover:decoration-foreground transition-colors truncate">
                  {post.title}
                </span>
                <span className="text-foreground/60 text-sm whitespace-nowrap hidden sm:inline-block tabular-nums">
                  {post.formattedDate}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="font-semibold">Connect</h2>
        <ul className="flex flex-col space-y-2">
          <li>
            <Link
              href="https://github.com/felixyeboah"
              target="_blank"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </li>
          <li>
            <Link
              href="https://twitter.com/sudocode_"
              target="_blank"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Twitter / X
            </Link>
          </li>
          <li>
            <Link
              href="mailto:me@felixyeboah.dev"
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              Email
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
