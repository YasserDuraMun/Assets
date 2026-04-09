using Microsoft.AspNetCore.Mvc;

namespace Assets.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        /// <summary>
        /// ??? ??? ???????
        /// </summary>
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new 
            { 
                status = "healthy",
                timestamp = DateTime.UtcNow,
                message = "Application is running"
            });
        }

        /// <summary>
        /// ??? ????? ????????
        /// </summary>
        [HttpGet("database")]
        public IActionResult Database()
        {
            try
            {
                return Ok(new 
                { 
                    database = "connected",
                    timestamp = DateTime.UtcNow 
                });
            }
            catch (Exception ex)
            {
                return Ok(new 
                { 
                    database = "error",
                    message = ex.Message,
                    timestamp = DateTime.UtcNow 
                });
            }
        }
    }
}