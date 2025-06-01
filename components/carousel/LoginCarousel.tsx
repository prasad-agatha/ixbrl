import { Carousel } from "react-bootstrap";

export default function LoginCarousel() {
  return (
    <div className="col-6 bg-layout d-none d-md-flex flex-column align-items-center justify-content-center">
      <Carousel className="text-center w-75 login-carousel" slide controls={false} interval={10000}>
        {[...Array(3)].map((e, id) => (
          <Carousel.Item key={id}>
            <img
              src="/imgs/login.webp"
              alt="-"
              style={{
                maxHeight: "calc(100vh - 250px)",
                maxWidth: "100%",
                marginBottom: "150px",
              }}
            />
            <Carousel.Caption
              className="p-0"
              style={{
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <h4 className="text-center color fw-600 ">Get Started with Apex</h4>
              <p className="text-center color-light">
                {`Many desktop publishing packages and web page editors now use Lorem Ipsum as
                    their default model text, and a search for 'lorem ipsum'`}
              </p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}
