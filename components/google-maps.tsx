export function GoogleMaps({ query = "Melbourne VIC, Australia" }: { query?: string }) {
  const encoded = encodeURIComponent(query)
  return (
    <section className="h-80 w-full">
      <iframe
        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509437!2d144.9537353153167!3d-37.81627997975159!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5df1f5a2c5%3A0x5045675218ce6e0!2s${encoded}!5e0!3m2!1sen!2s!4v1!4m1!1s0x6ad65d5df1f5a2c5%3A0x5045675218ce6e0`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Cafe Location"
      />
    </section>
  )
}
